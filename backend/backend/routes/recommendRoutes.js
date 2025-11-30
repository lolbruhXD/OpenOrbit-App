// backend/routes/recommendRoutes.js

import express from 'express';
const router = express.Router();
import { getRecommendedPosts } from '../controllers/recommendController.js';
import { protect } from '../middleware/authMiddleware.js';

// Route: GET /api/recommend/posts
router.route('/posts').get(protect, getRecommendedPosts);

export default router;