const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const superAdminMiddleware = require('../middleware/superAdminMiddleware');

//  VOTER REGISTRY (Master List) 
// Protected by adminMiddleware (Any staff can manage the roll)
router.post('/registry/register', authMiddleware, adminMiddleware, adminController.registerVoters);

//  USER & ROLE MANAGEMENT 
// Protected by superAdminMiddleware (Only the head can promote/demote staff)
router.patch('/users/manage', authMiddleware, superAdminMiddleware, adminController.manageUserRole);

//  AUDIT TRAIL 
// Protected by adminMiddleware (Only the head can view the full system logs)
router.get('/logs', authMiddleware, adminMiddleware, adminController.getSystemLogs);

module.exports = router;