const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const positionController = require('../controllers/positionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Standard security for all election routes
router.use(authMiddleware);

//This ensures the frontend receives ONE election object, not a list.
router.get('/active', electionController.getActiveElection);

/**
 * Standard GET /api/elections
 */
router.get('/', electionController.getAllElections);

/**
 * Admin Management
 */
router.post('/', adminMiddleware, electionController.createElection);
router.put('/:id', adminMiddleware, electionController.updateElection);
router.delete('/:id', adminMiddleware, electionController.deleteElection);

/**
 * Nested Position Resources
 */
router.get('/:electionId/positions', positionController.getPositions);
router.post('/:electionId/positions', adminMiddleware, positionController.createPosition);

module.exports = router;