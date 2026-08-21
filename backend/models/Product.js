const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    product_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    barcode: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Product;