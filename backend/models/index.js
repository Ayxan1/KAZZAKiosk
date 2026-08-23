const Kiosk = require('./Kiosk');
const User = require('./User');
const Product = require('./Product');
const KioskProduct = require('./KioskProduct');
const ProductHistory = require('./ProductHistory');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const ActivityLog = require('./ActivityLog');
const Shift = require('./Shift');

// Associations

// User - Kiosk
User.belongsTo(Kiosk, {
    foreignKey: 'assigned_kiosk_id',
    as: 'assignedKiosk'
});
Kiosk.hasMany(User, {
    foreignKey: 'assigned_kiosk_id',
    as: 'users'
});

// KioskProduct - Kiosk & Product
KioskProduct.belongsTo(Kiosk, {
    foreignKey: 'kiosk_id',
    as: 'kiosk'
});
KioskProduct.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});
Kiosk.hasMany(KioskProduct, {
    foreignKey: 'kiosk_id',
    as: 'kioskProducts'
});
Product.hasMany(KioskProduct, {
    foreignKey: 'product_id',
    as: 'kioskProducts'
});

// ProductHistory - Kiosk, Product, User
ProductHistory.belongsTo(Kiosk, {
    foreignKey: 'kiosk_id',
    as: 'kiosk'
});
ProductHistory.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});
ProductHistory.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Sale - Kiosk & User
Sale.belongsTo(Kiosk, {
    foreignKey: 'kiosk_id',
    as: 'kiosk'
});
Sale.belongsTo(User, {
    foreignKey: 'seller_id',
    as: 'seller'
});
Kiosk.hasMany(Sale, {
    foreignKey: 'kiosk_id',
    as: 'sales'
});
User.hasMany(Sale, {
    foreignKey: 'seller_id',
    as: 'sales'
});

// SaleItem - Sale & Product
SaleItem.belongsTo(Sale, {
    foreignKey: 'sale_id',
    as: 'sale'
});
SaleItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});
Sale.hasMany(SaleItem, {
    foreignKey: 'sale_id',
    as: 'items'
});

// ActivityLog - User
ActivityLog.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});
ActivityLog.belongsTo(Kiosk, {
    foreignKey: 'kiosk_id',
    as: 'kiosk'
});

// Shift - User & Kiosk
Shift.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});
Shift.belongsTo(Kiosk, {
    foreignKey: 'kiosk_id',
    as: 'kiosk'
});
User.hasMany(Shift, {
    foreignKey: 'user_id',
    as: 'shifts'
});
Kiosk.hasMany(Shift, {
    foreignKey: 'kiosk_id',
    as: 'shifts'
});

module.exports = {
    Kiosk,
    User,
    Product,
    KioskProduct,
    ProductHistory,
    Sale,
    SaleItem,
    ActivityLog,
    Shift
};