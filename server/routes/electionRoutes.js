const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// VOTER & ADMIN SHARED ROUTES 
router.get('/', authMiddleware, electionController.getAllElections);
router.get('/active', authMiddleware, electionController.getAllElections);

// ADMIN ONLY ROUTES 
// POST 
router.post('/', authMiddleware, adminMiddleware, electionController.createElection);

// DELETE 
router.delete('/:id', authMiddleware, adminMiddleware, electionController.deleteElection);

module.exports = router;