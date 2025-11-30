import express from 'express';
const router = express.Router({ mergeParams: true }); // mergeParams is important for nested routes
import {
  createComment,
  getCommentsForPost,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(protect, createComment).get(getCommentsForPost);

export default router;