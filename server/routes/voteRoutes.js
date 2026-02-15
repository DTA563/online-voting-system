const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const authMiddleware = require('../middleware/authMiddleware');
const voterMiddleware = require('../middleware/voterMiddleware');

// Only authenticated users with role as 'voter' can cast a vote
router.post('/cast', authMiddleware, voterMiddleware, voteController.castVote);

module.exports = router;