const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const {
    authenticate,
    isAdmin
} = require('../middleware/auth');

// Admin only - full activity/audit log across all users
router.get('/', authenticate, isAdmin, activityController.getActivityLogs);

module.exports = router;