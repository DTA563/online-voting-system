const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const authMiddleware = require('../middleware/authMiddleware');

// Only authenticated users can cast a vote
router.post('/cast', authMiddleware, voteController.castVote);

module.exports = router;