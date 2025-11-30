import Post from '../models/PostModel.js';
import User from '../models/userModel.js';

const createPost = async (req, res) => {
  try {
    const { title, language, code, summary, tags, media_url } = req.body;
    if (!code && !media_url) {
      return res.status(400).json({ message: 'Post must contain either code or media' });
    }
    
    const post = new Post({ 
      title, 
      language, 
      code, 
      summary,
      tags: tags || [],
      media_url,
      user: req.user._id 
    });
    
    const createdPost = await post.save();
    
    // Populate user info for real-time update
    await createdPost.populate('user', 'name email avatarUrl');
    
    // Emit real-time update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.to('feed_room').emit('new_post', createdPost);
    }
    
    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// Get all posts for feed (public posts)
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find()
      .populate('user', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPosts = await Post.countDocuments();
    
    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name email avatarUrl')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email avatarUrl');
    if (post) {
      // Allow viewing any post (not just own posts)
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch post', error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, language, code, summary, tags, media_url } = req.body;
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      post.title = title || post.title;
      post.language = language || post.language;
      post.code = code || post.code;
      post.summary = summary || post.summary;
      post.tags = tags || post.tags;
      post.media_url = media_url || post.media_url;
      
      const updatedPost = await post.save();
      await updatedPost.populate('user', 'name email avatarUrl');
      
      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.to('feed_room').emit('post_updated', updatedPost);
      }
      
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      await post.deleteOne();
      
      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.to('feed_room').emit('post_deleted', { postId: req.params.id });
      }
      
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const alreadyLiked = post.likes.find(
      (like) => like.toString() === req.user._id.toString()
    );
    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.user._id.toString()
      );
      res.status(200).json({ message: 'Post unliked' });
    } else {
      post.likes.push(req.user._id);
      res.status(200).json({ message: 'Post liked' });
    }
    await post.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('feed_room').emit('post_liked', { 
        postId: req.params.id, 
        likesCount: post.likes.length,
        isLiked: !alreadyLiked
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post', error: error.message });
  }
};

export { createPost, getAllPosts, getMyPosts, getPostById, updatePost, deletePost, likePost };