const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const SaleItem = sequelize.define('SaleItem', {
    sale_item_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sale_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'sales',
            key: 'sale_id'
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'sale_items',
    timestamps: false
});

module.exports = SaleItem;