const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const KioskProduct = sequelize.define('KioskProduct', {
    kiosk_product_id: {
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
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'kiosk_products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{
        unique: true,
        fields: ['kiosk_id', 'product_id']
    }]
});

module.exports = KioskProduct;