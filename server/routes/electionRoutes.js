const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Voters & Admins can view elections
router.get('/', authMiddleware, electionController.getAllElections);

// Only Admins can create elections
router.post('/', authMiddleware, adminMiddleware, electionController.createElection);

module.exports = router;