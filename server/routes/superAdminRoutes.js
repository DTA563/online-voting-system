const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/authMiddleware');
const superAdminMiddleware = require('../middleware/superAdminMiddleware');

// Apply these to ALL routes in this file
router.use(authMiddleware);
router.use(superAdminMiddleware);

//  USER MANAGEMENT 
router.get('/users', superAdminController.getAllUsers);
router.patch('/users/manage', superAdminController.manageUserRole);
router.post('/users/reset-password', superAdminController.resetUserPassword);

//  SYSTEM AUDIT 
router.get('/logs', superAdminController.getSystemLogs);
router.get('/logs/id', superAdminController.getSystemLogs);

module.exports = router;