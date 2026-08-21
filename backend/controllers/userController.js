const {
    User,
    Kiosk
} = require('../models');
const {
    logActivity
} = require('../utils/activityLogger');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: {
                exclude: ['password']
            },
            include: [{
                model: Kiosk,
                as: 'assignedKiosk'
            }],
            order: [
                ['full_name', 'ASC']
            ]
        });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Create user (Admin only)
exports.createUser = async (req, res) => {
    try {
        const {
            username,
            password,
            full_name,
            role,
            assigned_kiosk_id
        } = req.body;

        // Validate input
        if (!username || !password || !full_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Bütün məlumatlar tələb olunur.'
            });
        }

        // Check if username exists
        const existingUser = await User.findOne({
            where: {
                username
            }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu istifadəçi adı artıq mövcuddur.'
            });
        }

        // Create user
        const user = await User.create({
            username,
            password,
            full_name,
            role,
            assigned_kiosk_id: role === 'seller' ? assigned_kiosk_id : null
        });

        const result = await User.findByPk(user.user_id, {
            attributes: {
                exclude: ['password']
            },
            include: [{
                model: Kiosk,
                as: 'assignedKiosk'
            }]
        });

        await logActivity(
            req.user.user_id,
            'CREATE_USER',
            `${req.user.full_name} yeni istifadəçi yaratdı: ${full_name} (${username}, ${role}).`,
            role === 'seller' ? assigned_kiosk_id : null
        );

        res.status(201).json({
            success: true,
            message: 'İstifadəçi uğurla yaradıldı.',
            user: result
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
    try {
        const {
            userId
        } = req.params;
        const {
            username,
            password,
            full_name,
            role,
            assigned_kiosk_id,
            is_active
        } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'İstifadəçi tapılmadı.'
            });
        }

        // Check if username is taken by another user
        if (username && username !== user.username) {
            const existingUser = await User.findOne({
                where: {
                    username
                }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu istifadəçi adı artıq mövcuddur.'
                });
            }
        }

        await user.update({
            username,
            ...(password && {
                password
            }),
            full_name,
            role,
            assigned_kiosk_id: role === 'seller' ? assigned_kiosk_id : null,
            is_active
        });

        const result = await User.findByPk(userId, {
            attributes: {
                exclude: ['password']
            },
            include: [{
                model: Kiosk,
                as: 'assignedKiosk'
            }]
        });

        await logActivity(
            req.user.user_id,
            'UPDATE_USER',
            `${req.user.full_name} istifadəçini yenilədi: ${full_name} (${username})${password ? ', şifrə sıfırlandı' : ''}.`,
            role === 'seller' ? assigned_kiosk_id : null
        );

        res.json({
            success: true,
            message: 'İstifadəçi uğurla yeniləndi.',
            user: result
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'İstifadəçi tapılmadı.'
            });
        }

        await user.destroy();

        await logActivity(
            req.user.user_id,
            'DELETE_USER',
            `${req.user.full_name} istifadəçini sildi: ${user.full_name} (${user.username}).`,
            user.assigned_kiosk_id
        );

        res.json({
            success: true,
            message: 'İstifadəçi uğurla silindi.'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};