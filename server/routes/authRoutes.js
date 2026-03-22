const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// URL: /api/auth/register
router.post('/register', authController.register);

// URL: /api/auth/login
router.post('/login', authController.login);

// URL: /api/auth/logout
// Requires authMiddleware so we can record exactly WHO logged out in the audit trail
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;