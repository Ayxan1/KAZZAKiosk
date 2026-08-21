const {
    ActivityLog,
    User,
    Kiosk
} = require('../models');
const {
    Op
} = require('sequelize');

// Get activity logs (Admin only) - a full audit trail of logins,
// logouts, and create/update/delete actions across the system.
// Supports filtering by user, kiosk, action type, product (text match
// on description) and a created_at date range.
exports.getActivityLogs = async (req, res) => {
    try {
        const {
            userId,
            kioskId,
            action,
            product,
            startDate,
            endDate,
            limit
        } = req.query;

        const where = {};
        if (userId) where.user_id = userId;
        if (kioskId) where.kiosk_id = kioskId;
        if (action) where.action_type = action;
        if (product) {
            where.description = {
                [Op.iLike]: `%${product}%`
            };
        }
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at[Op.gte] = new Date(`${startDate}T00:00:00`);
            if (endDate) where.created_at[Op.lte] = new Date(`${endDate}T23:59:59.999`);
        }

        const logs = await ActivityLog.findAll({
            where,
            include: [{
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'username', 'full_name', 'role']
                },
                {
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                }
            ],
            order: [
                ['created_at', 'DESC']
            ],
            limit: limit ? parseInt(limit, 10) : 200
        });

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};