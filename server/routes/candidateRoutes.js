const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// General login required
router.use(authMiddleware);

// GET /api/candidates (Supports ?position_id=X)
router.get('/', candidateController.getCandidates);

// GET /api/candidates/:id
router.get('/:id', candidateController.getCandidateById);

// Admin Only
router.post('/', adminMiddleware, candidateController.createCandidate);
router.put('/:id', adminMiddleware, candidateController.updateCandidate);
router.delete('/:id', adminMiddleware, candidateController.deleteCandidate);

module.exports = router;