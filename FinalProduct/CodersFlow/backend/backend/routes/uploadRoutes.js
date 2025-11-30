import express from 'express';
import { upload, uploadFile, uploadMultipleFiles, deleteFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Single file upload route
router.post('/single', protect, upload.single('file'), uploadFile);

// Multiple files upload route
router.post('/multiple', protect, upload.array('files', 5), uploadMultipleFiles);

// Delete file route
router.delete('/:filename', protect, deleteFile);

export default router;
