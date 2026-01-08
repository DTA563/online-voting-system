const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

// Anyone can see results (if the controller allows it based on time/role)
// We still use authMiddleware to identify if they are an admin
router.get('/:electionId', authMiddleware, resultController.getElectionResults);

module.exports = router;