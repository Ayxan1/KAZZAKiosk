const {
    ActivityLog
} = require('../models');

// Best-effort audit log write. Never throws - a logging failure
// must not break the real operation (login, sale, product edit, etc.).
async function logActivity(userId, actionType, description, kioskId = null) {
    try {
        await ActivityLog.create({
            user_id: userId,
            action_type: actionType,
            description,
            kiosk_id: kioskId
        });
    } catch (error) {
        console.error('Activity log yazıla bilmədi:', error.message);
    }
}

module.exports = {
    logActivity
};