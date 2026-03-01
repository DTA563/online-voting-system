const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'candidate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// General login required
router.use(authMiddleware);

// GET /api/candidates (Supports ?position_id=X)
router.get('/', candidateController.getCandidates);

// GET /api/candidates/:id
router.get('/:id', candidateController.getCandidateById);

// Admin Only - with multer for photo uploads
router.post('/', adminMiddleware, upload.single('photo'), candidateController.createCandidate);
router.put('/:id', adminMiddleware, upload.single('photo'), candidateController.updateCandidate);
router.delete('/:id', adminMiddleware, candidateController.deleteCandidate);

module.exports = router;