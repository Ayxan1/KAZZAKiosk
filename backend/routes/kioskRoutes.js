const express = require('express');
const router = express.Router();
const kioskController = require('../controllers/kioskController');
const {
    authenticate,
    isAdmin,
    hasKioskAccess
} = require('../middleware/auth');

// Public route - used by login page to populate kiosk selector (no auth)
router.get('/public', kioskController.getPublicKiosks);

// All routes below require authentication
router.use(authenticate);

// Get all kiosks (Admin only)
router.get('/', isAdmin, kioskController.getAllKiosks);

// Get single kiosk
router.get('/:kioskId', hasKioskAccess('kioskId'), kioskController.getKiosk);

// Create kiosk (Admin only)
router.post('/', isAdmin, kioskController.createKiosk);

// Update kiosk (Admin only)
router.put('/:kioskId', isAdmin, kioskController.updateKiosk);

// Delete kiosk (Admin only)
router.delete('/:kioskId', isAdmin, kioskController.deleteKiosk);

module.exports = router;