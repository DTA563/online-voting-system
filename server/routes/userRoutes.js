const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect these routes with Admin middleware
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', userController.getUsers);
router.patch('/:id', userController.verifyUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
