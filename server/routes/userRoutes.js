const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes here require authentication and administrative privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// URL: GET /api/users (can use ?role=voter)
router.get('/', userController.getUsers);

// URL: PATCH /api/users/verify/:id
router.patch('/verify/:id', userController.verifyUser);

// URL: DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

module.exports = router;