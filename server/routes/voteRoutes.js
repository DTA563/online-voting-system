const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const resultController = require('../controllers/resultController'); 
const authMiddleware = require('../middleware/authMiddleware');
const voterMiddleware = require('../middleware/voterMiddleware');

// Only authenticated users with role as 'voter' can cast a vote
router.post('/cast', authMiddleware, voterMiddleware, voteController.castVote);

// FIXED: Added authMiddleware and voterMiddleware to prevent the "req.user is undefined" crash
router.get('/status/:electionId', authMiddleware, voteController.checkVoterStatus);

// Protected route for getting election results
router.get('/turnout/:electionId', authMiddleware, resultController.getElectionResults);

module.exports = router;