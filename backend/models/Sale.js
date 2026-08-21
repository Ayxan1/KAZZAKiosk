const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const Sale = sequelize.define('Sale', {
    sale_id: {
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
    seller_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    payment_method: {
        type: DataTypes.ENUM('CASH', 'CARD'),
        allowNull: false
    },
    sale_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Sale;