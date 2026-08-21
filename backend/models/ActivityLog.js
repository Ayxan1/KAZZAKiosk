const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

// General-purpose audit trail: who did what and when.
// Covers login/logout plus create/update/delete actions across
// kiosks, users, products and sales - so admin can see a full
// timeline of every user's activity, not just product changes.
const ActivityLog = sequelize.define('ActivityLog', {
    log_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    kiosk_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'kiosks',
            key: 'kiosk_id'
        }
    },
    action_type: {
        type: DataTypes.ENUM(
            'LOGIN',
            'LOGOUT',
            'CREATE_PRODUCT',
            'UPDATE_PRODUCT',
            'DELETE_PRODUCT',
            'CREATE_SALE',
            'CREATE_KIOSK',
            'UPDATE_KIOSK',
            'CREATE_USER',
            'UPDATE_USER',
            'DELETE_USER'
        ),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: false
    }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ActivityLog;