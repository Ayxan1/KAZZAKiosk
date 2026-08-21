const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const ProductHistory = sequelize.define('ProductHistory', {
    history_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    kiosk_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'kiosks',
            key: 'kiosk_id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'product_id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    action_type: {
        type: DataTypes.ENUM('ADD', 'EDIT_NAME', 'EDIT_PRICE', 'EDIT_STOCK', 'EDIT_CODE', 'EDIT_BARCODE'),
        allowNull: false
    },
    old_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    new_value: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'product_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ProductHistory;