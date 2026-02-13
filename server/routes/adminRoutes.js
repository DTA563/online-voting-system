const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const superAdminMiddleware = require('../middleware/superAdminMiddleware');

//  LEVEL 1: PUBLIC/VOTER 
router.get('/elections', adminController.getElectionDetails);

//  LEVEL 2: ADMIN & SUPER ADMIN 
// Managing candidates and starting elections
router.post('/elections', authMiddleware, adminMiddleware, adminController.createElection);
router.post('/candidates', authMiddleware, adminMiddleware, adminController.addCandidate);

// Voter Registry Management
// Allows admin to add the "Master List" of eligible IDs for an election
router.post('/registry/register', authMiddleware, adminMiddleware, adminController.registerVoters);

//  LEVEL 3: SUPER ADMIN ONLY 
// High-risk system actions
router.get('/stats', authMiddleware, superAdminMiddleware, adminController.getDashboardStats);
router.patch('/users/manage', authMiddleware, superAdminMiddleware, adminController.manageUserRole);
router.get('/logs', authMiddleware, superAdminMiddleware, adminController.getSystemLogs);

// User Management (Super Admin)
router.get('/users', authMiddleware, superAdminMiddleware, superAdminController.getAllUsers);
router.post('/users/reset-password', authMiddleware, superAdminMiddleware, superAdminController.resetUserPassword);

module.exports = router;