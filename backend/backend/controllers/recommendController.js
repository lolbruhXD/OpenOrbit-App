// backend/controllers/recommendController.js
import { PythonShell } from 'python-shell';
import Post from '../models/PostModel.js';
import User from '../models/userModel.js';

// Helper function to safely map and stringify IDs in arrays/objects
const cleanMongoData = (data) => {
    return data.map(doc => {
        // Convert the main _id
        doc._id = doc._id.toString();
        
        // Convert IDs in 'following' array
        if (doc.following) {
            doc.following = doc.following.map(id => id.toString());
        }
        // Convert IDs in 'likes' array for posts
        if (doc.likes) {
            doc.likes = doc.likes.map(id => id.toString());
        }
        // Convert author ID for posts
        if (doc.user) {
            doc.user = doc.user.toString();
        }
        return doc;
    });
};


const getRecommendedPosts = async (req, res) => {
  try {
    // 1. Fetch data and clean it up immediately
    const rawUsers = await User.find({}).lean();
    const rawPosts = await Post.find({}).lean();
    
    // Apply the cleaning function to ensure all IDs are strings
    const allUsers = cleanMongoData(rawUsers);
    const allPosts = cleanMongoData(rawPosts);
    
    const currentUserId = req.user._id.toString(); 

    const options = {
      mode: 'json',
      pythonOptions: ['-u'],
      scriptPath: './utils',
      args: [
        JSON.stringify(allUsers), 
        JSON.stringify(allPosts), 
        currentUserId
      ],
    };

    // 2. Execute the Python script
    PythonShell.run('recommend.py', options)
      .then(async (results) => {
        const recommendedPostIds = results[0];

        // ... (Rest of the post fetching logic remains the same)
        const posts = await Post.find({ '_id': { $in: recommendedPostIds } }).populate('user', 'name');
        
        const orderedPosts = recommendedPostIds.map(id => posts.find(p => p._id.toString() === id)).filter(p => p); 

        res.status(200).json(orderedPosts);
      })
      .catch(error => {
        console.error("PythonShell Error:", error);
        res.status(500).json({ message: 'Recommendation engine processing failed.' });
      });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: 'Server error while fetching data.' });
  }
};

export { getRecommendedPosts };