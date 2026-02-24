const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// All routes in this file require at least Admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// --- DASHBOARD STATS ---
router.get('/stats', adminController.getDashboardStats);

// --- VOTER REGISTRY (Master List) ---
router.post('/registry/register', adminController.registerVoters);

module.exports = router;