import express from 'express';
import { logEvent } from '../controllers/logController.js';

const router = express.Router();

router.post('/', logEvent);

export default router;