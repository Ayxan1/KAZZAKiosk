const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const {
    authenticate,
    isAdmin
} = require('../middleware/auth');

// Seller: own shift status/summary + take-over/hand-over
router.get('/summary', authenticate, shiftController.getShiftSummary);
router.post('/take-over', authenticate, shiftController.takeOverShift);
router.post('/hand-over', authenticate, shiftController.handOverShift);

// Admin: see who currently holds each kiosk
router.get('/active', authenticate, isAdmin, shiftController.getActiveShifts);

// Admin: shift history (per kiosk or all) + drill-down into a shift's sales
router.get('/history', authenticate, isAdmin, shiftController.getShiftHistory);
router.get('/:shiftId/sales', authenticate, isAdmin, shiftController.getShiftSales);

module.exports = router;