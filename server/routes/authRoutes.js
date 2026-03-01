const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // ADDED: To identify the user logging out

// URL: /api/auth/register
router.post('/register', authController.register);

// URL: /api/auth/login
router.post('/login', authController.login);

// URL: /api/auth/logout
// ADDED: Requires authMiddleware so we can record exactly WHO logged out in the audit trail
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;