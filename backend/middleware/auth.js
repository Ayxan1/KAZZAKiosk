const jwt = require('jsonwebtoken');
const {
    User
} = require('../models');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token tapılmadı. Zəhmət olmasa daxil olun.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id, {
            attributes: {
                exclude: ['password']
            }
        });

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'İstifadəçi tapılmadı və ya deaktiv edilib.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token etibarsızdır.',
            error: error.message
        });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu əməliyyat üçün admin hüququ lazımdır.'
        });
    }
    next();
};

// Check if user has access to kiosk
const hasKioskAccess = (kioskIdParam = 'kioskId') => {
    return (req, res, next) => {
        const kioskId = req.params[kioskIdParam] || req.body.kiosk_id;

        // Admin has access to all kiosks
        if (req.user.role === 'admin') {
            return next();
        }

        // Seller can only access their assigned kiosk
        if (req.user.assigned_kiosk_id !== kioskId) {
            return res.status(403).json({
                success: false,
                message: 'Bu kioska giriş icazəniz yoxdur.'
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    isAdmin,
    hasKioskAccess
};