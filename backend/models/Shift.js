const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

// Tracks a seller's "shift" at a kiosk: when they took over the register
// (təhvil aldı) and when they handed it back (təhvil verdi). While
// handed_over_at is null the shift is considered OPEN. Only one open
// shift is allowed per kiosk — another seller must wait until the
// current holder hands it over.
const Shift = sequelize.define('Shift', {
    shift_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    kiosk_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'kiosks',
            key: 'kiosk_id'
        }
    },
    taken_over_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    handed_over_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'shifts',
    timestamps: false
});

module.exports = Shift;