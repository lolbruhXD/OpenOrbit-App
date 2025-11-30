import express from 'express';
const router = express.Router();
import { askAgent, verifyKey } from '../controllers/agentController.js';
import { protect } from '../middleware/authMiddleware.js';

// This route will handle all questions sent to the AI.
// We use the 'protect' middleware to ensure only logged-in users can use the agent.
router.post('/ask', protect, askAgent);
// Dev-only: verify server-side Gemini key (no auth required so you can test quickly)
router.get('/verify-key', verifyKey);

export default router;