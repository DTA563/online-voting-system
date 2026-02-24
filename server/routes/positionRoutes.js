const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require login
router.use(authMiddleware);

// GET /api/positions (Supports ?election_id=X)
router.get('/', positionController.getPositions);

// GET /api/positions/:id
router.get('/:id', positionController.getPositionById);
router.get('/:positionId/candidates', candidateController.getCandidates);

// Admin Only
router.post('/', adminMiddleware, positionController.createPosition);
router.put('/:id', adminMiddleware, positionController.updatePosition);
router.delete('/:id', adminMiddleware, positionController.deletePosition);

module.exports = router;