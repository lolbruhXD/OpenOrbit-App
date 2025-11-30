import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar)$/i;
  const allowedMimeTypes = /^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|text\/plain|application\/zip|application\/x-rar-compressed)/;
  
  const extname = allowedExtensions.test(file.originalname);
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image, document, and archive files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Handle single file upload
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'codersflow_uploads',
    });

    // Optionally, delete the local file after upload
    fs.unlink(req.file.path, () => {});

    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        url: result.secure_url,
        public_id: result.public_id,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

// Handle multiple file uploads
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

// Delete uploaded file
export const deleteFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'File deletion failed', error: error.message });
  }
};
