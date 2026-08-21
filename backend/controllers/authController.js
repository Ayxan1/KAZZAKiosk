const jwt = require('jsonwebtoken');
const {
    User,
    Kiosk
} = require('../models');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({
        user_id: userId
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Login
exports.login = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'İstifadəçi adı və şifrə tələb olunur.'
            });
        }

        // Find user
        const user = await User.findOne({
            where: {
                username,
                is_active: true
            },
            include: [{
                model: Kiosk,
                as: 'assignedKiosk'
            }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'İstifadəçi adı və ya şifrə yanlışdır.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'İstifadəçi adı və ya şifrə yanlışdır.'
            });
        }

        // Kiosk assignment is already known from the user's own record (assigned_kiosk_id),
        // so sellers don't need to type/select anything about their kiosk to log in.

        // Generate token
        const token = generateToken(user.user_id);

        // Return user data without password
        const userData = {
            user_id: user.user_id,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
            assigned_kiosk_id: user.assigned_kiosk_id,
            assignedKiosk: user.assignedKiosk
        };

        res.json({
            success: true,
            message: 'Uğurla daxil oldunuz.',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: {
                exclude: ['password']
            },
            include: [{
                model: Kiosk,
                as: 'assignedKiosk'
            }]
        });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};