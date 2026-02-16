const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Voters & Admins can view election
router.get('/', authMiddleware, electionController.getAllElections);

router.get('/active', authMiddleware, electionController.getAllElections);
//router.get('/elections', authMiddleware, electionController.getAllElections);

// Only Admins can create elections
router.post('/', authMiddleware, adminMiddleware, electionController.createElection);

module.exports = router;