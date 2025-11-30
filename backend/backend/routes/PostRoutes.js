import express from 'express';
const router = express.Router();

// Import all necessary controller functions for posts
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost, // Ensure likePost is imported
} from '../controllers/postController.js';

import { protect } from '../middleware/authMiddleware.js';
import commentRoutes from './commentRoutes.js';

// --- Define all routes ---

// Route for getting all posts (public feed)
router.route('/feed').get(getAllPosts);

// Routes for creating a post and getting all of a user's posts
router.route('/').get(protect, getMyPosts).post(protect, createPost);

// Route for liking/unliking a post
router.route('/:id/like').put(protect, likePost); // <-- THIS WAS THE MISSING LINE

// Routes for getting, updating, and deleting a single specific post
router
  .route('/:id')
  .get(protect, getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// Use the comment routes for any request related to a post's comments
router.use('/:postId/comments', commentRoutes);

export default router;