const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const Kiosk = sequelize.define('Kiosk', {
    kiosk_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    kiosk_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'kiosks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Kiosk;