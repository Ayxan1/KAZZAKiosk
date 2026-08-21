const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
    authenticate,
    isAdmin,
    hasKioskAccess
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get products across all kiosks (Admin only)
router.get('/all', isAdmin, productController.getAllKioskProducts);

// Get products for a kiosk
router.get('/kiosk/:kioskId', hasKioskAccess('kioskId'), productController.getKioskProducts);

// Add product to kiosk
router.post('/kiosk/:kioskId', hasKioskAccess('kioskId'), productController.addProductToKiosk);

// Update product in kiosk
router.put('/kiosk/:kioskId/product/:productId', hasKioskAccess('kioskId'), productController.updateKioskProduct);

// Delete product from kiosk
router.delete('/kiosk/:kioskId/product/:productId', hasKioskAccess('kioskId'), productController.deleteKioskProduct);

// Get product history (Admin only)
router.get('/history', isAdmin, productController.getProductHistory);

module.exports = router;