const {
    ActivityLog,
    User
} = require('../models');

// Get activity logs (Admin only) - a full audit trail of logins,
// logouts, and create/update/delete actions across the system.
exports.getActivityLogs = async (req, res) => {
    try {
        const {
            userId,
            action,
            limit
        } = req.query;

        const where = {};
        if (userId) where.user_id = userId;
        if (action) where.action_type = action;

        const logs = await ActivityLog.findAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['user_id', 'username', 'full_name', 'role']
            }],
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