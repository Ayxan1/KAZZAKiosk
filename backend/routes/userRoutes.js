const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
    authenticate,
    isAdmin
} = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

// Get all users
router.get('/', userController.getAllUsers);

// Create user
router.post('/', userController.createUser);

// Update user
router.put('/:userId', userController.updateUser);

// Delete user
router.delete('/:userId', userController.deleteUser);

module.exports = router;