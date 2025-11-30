import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
  toggleSavePost,
  getUserProfile,
  followUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/save/:postId').put(protect, toggleSavePost);
router.route('/follow/:id').put(protect, followUser);

// Public profile route
router.route('/profile/:id').get(getUserProfile);

export default router;