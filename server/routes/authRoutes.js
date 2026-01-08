const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// URL: /api/auth/register
router.post('/register', authController.register);

// URL: /api/auth/login
router.post('/login', authController.login);

module.exports = router;