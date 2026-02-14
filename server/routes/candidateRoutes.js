const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Voters can view candidates for an election
router.get('/election/:electionId', authMiddleware, candidateController.getCandidatesByElection);

// Only Admins can add candidates
router.post('/', authMiddleware, adminMiddleware, candidateController.addCandidate);

module.exports = router;