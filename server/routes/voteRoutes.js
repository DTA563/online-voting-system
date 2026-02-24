const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const resultController = require('../controllers/resultController'); // Import result controller
const authMiddleware = require('../middleware/authMiddleware');
const voterMiddleware = require('../middleware/voterMiddleware');

// Only authenticated users with role as 'voter' can cast a vote
router.post('/cast', authMiddleware, voterMiddleware, voteController.castVote);

router.get('/turnout/:electionId', authMiddleware, resultController.getElectionResults);

module.exports = router;