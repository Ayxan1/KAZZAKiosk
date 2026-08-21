const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const {
    authenticate,
    isAdmin,
    hasKioskAccess
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create a new sale
router.post('/', authenticate, salesController.createSale);

// Get sales for a kiosk
router.get('/kiosk/:kioskId', hasKioskAccess('kioskId'), salesController.getKioskSales);

// Get all sales (Admin only)
router.get('/', isAdmin, salesController.getAllSales);

// Get single sale
router.get('/:saleId', authenticate, salesController.getSale);

module.exports = router;