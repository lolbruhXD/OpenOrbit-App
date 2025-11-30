import sys
import json
import networkx as nx

# --- Helper function to safely convert ID to string ---
def safe_id(data):
    """Converts MongoDB ObjectId or dictionary into a string ID."""
    if isinstance(data, dict) and '$oid' in data:
        return str(data['$oid'])
    return str(data)

def build_graph(users, posts):
    """Builds a graph with Users, Posts, and relationships (Edges)."""
    G = nx.Graph()
    
    # Debug counter for successfully added edges
    edge_counts = {'CREATED': 0, 'LIKED': 0, 'FOLLOWS': 0}
    
    # Add Nodes: Users and Posts
    for user in users:
        user_id = safe_id(user['_id'])
        G.add_node(user_id, type='user', skills=user.get('skills', []))
    for post in posts:
        post_id = safe_id(post['_id'])
        G.add_node(post_id, type='post', skills=[post.get('language', 'general')])
    
    # Add Edges: Relationships
    for post in posts:
        post_id = safe_id(post['_id'])
        
        # Edge 1: User CREATED Post
        creator_id = safe_id(post['user'])
        G.add_edge(creator_id, post_id, relationship='CREATED')
        edge_counts['CREATED'] += 1
        
        # Edge 2: User LIKED Post
        for liked_by_id in post.get('likes', []):
            liked_by_id_str = safe_id(liked_by_id)
            G.add_edge(liked_by_id_str, post_id, relationship='LIKED')
            edge_counts['LIKED'] += 1
            
    for user in users:
        user_id = safe_id(user['_id'])
        # Edge 3: User FOLLOWS User
        for followed_user_id in user.get('following', []):
            followed_user_id_str = safe_id(followed_user_id)
            G.add_edge(user_id, followed_user_id_str, relationship='FOLLOWS')
            edge_counts['FOLLOWS'] += 1
            
    # Print edge creation debug info
    print(f"--- Graph Edges Created: {edge_counts} ---", file=sys.stderr)
    
    return G

def get_skill_relevance(user_skills, post_skills):
    """Calculates Jaccard similarity between two sets of skills (0 to 1)."""
    set1 = set(user_skills)
    set2 = set(post_skills)
    
    # Intersection / Union
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    
    return intersection / union if union != 0 else 0

# --- Main Execution Block ---
if __name__ == "__main__":
    # 1. Get data passed from Node.js via sys.argv (JSON strings)
    try:
        users_json = json.loads(sys.argv[1])
        posts_json = json.loads(sys.argv[2])
        current_user_id = sys.argv[3]
    except Exception as e:
        # Report the error to the Node.js console
        print(f"JSON Input Error: {e}", file=sys.stderr)
        print(json.dumps([]))
        sys.exit(0)

    # --- DEBUG START --- (Keep this section)
    print("--- DEBUG START ---", file=sys.stderr)
    print(f"Current User ID: {current_user_id}", file=sys.stderr)
    print(f"Users Received: {len(users_json)}", file=sys.stderr)
    print(f"Posts Received: {len(posts_json)}", file=sys.stderr)
    # --- DEBUG END ---
    
    # 2. Build the Graph
    G = build_graph(users_json, posts_json)
    
    # 3. Find Community Candidate Posts (Posts from people the user FOLLOWS)
    candidate_posts = set()
    
    # Check if current user node exists in graph (important!)
    current_user_id_str = safe_id(current_user_id)
    if current_user_id_str in G:
        # print(f"Current User Node found: {current_user_id_str}", file=sys.stderr)
        
        for followed_user_id in G.neighbors(current_user_id_str):
            if G.nodes[followed_user_id].get('type') == 'user':
                # Find posts connected to this followed user
                for post_id in G.neighbors(followed_user_id):
                    if G.nodes[post_id].get('type') == 'post':
                        # Get the author of the post (requires safe ID conversion)
                        post_author_id = next((safe_id(p['user']) for p in posts_json if safe_id(p['_id']) == post_id), None)
                        
                        # Exclude posts the user created themselves
                        if post_author_id != current_user_id_str:
                            candidate_posts.add(post_id)

    # Print candidate list debug info
    print(f"Candidate Posts Found: {len(candidate_posts)}", file=sys.stderr)
    # print(f"Candidate IDs: {list(candidate_posts)}", file=sys.stderr) # Optionally print IDs for verification
    
    # If no candidates are found, exit early
    if not candidate_posts:
        print(json.dumps([]))
        sys.exit(0)


    # 4. Score and Rank candidates by Skill Relevance
    current_user_node = G.nodes.get(current_user_id_str)
    if not current_user_node:
        print("Error: Current user node not found for scoring.", file=sys.stderr)
        print(json.dumps([]))
        sys.exit(0)
        
    current_user_skills = current_user_node.get('skills', [])
    recommendations = []
    
    for post_id in candidate_posts:
        post_node = G.nodes.get(post_id)
        if not post_node: continue
        
        post_skills = post_node.get('skills', [])
        
        # Skill Relevance Score (The main ranking factor)
        relevance_score = get_skill_relevance(current_user_skills, post_skills)
        
        # Add post popularity (like count) as a secondary factor
        # Find the post dictionary to get the likes array length
        post_data = next((p for p in posts_json if safe_id(p['_id']) == post_id), None)
        post_likes_count = len(post_data.get('likes', [])) if post_data else 0
        
        # Weighting: 1 like = 0.01 score boost
        popularity_score = post_likes_count * 0.01 
        
        final_score = relevance_score + popularity_score
        
        recommendations.append({'postId': post_id, 'score': final_score})

    # 5. Sort and return top 10 recommended post IDs
    sorted_recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)
    top_post_ids = [rec['postId'] for rec in sorted_recommendations][:10]
    
    # Print the result as a JSON string for Node.js to capture
    print(json.dumps(top_post_ids))
# Note: Ensure that the Node.js side captures stdout and stderr separately to avoid mixing debug info with JSON output.