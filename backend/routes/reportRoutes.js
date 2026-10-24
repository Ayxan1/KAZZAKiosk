const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const {
    authenticate,
    isAdmin
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get dashboard statistics
router.get('/dashboard', reportController.getDashboardStats);

// Get sales report
router.get('/sales', reportController.getSalesReport);

// Sale lines for the selected range (admin statistics)
router.get('/sales-details', isAdmin, reportController.getSalesDetails);

// Get low stock products
router.get('/low-stock', reportController.getLowStockProducts);

// Get seller performance (Admin only)
router.get('/seller-performance', isAdmin, reportController.getSellerPerformance);

module.exports = router;