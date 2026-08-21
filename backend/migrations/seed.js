const bcrypt = require('bcryptjs');
const {
    User,
    Kiosk
} = require('../models');

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');

        // Create a default kiosk
        const kiosk = await Kiosk.create({
            kiosk_name: 'Kiosk A'
        });
        console.log('✅ Default kiosk created:', kiosk.kiosk_name);

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            username: 'admin',
            password: adminPassword,
            full_name: 'Admin',
            role: 'admin',
            is_active: true
        });
        console.log('✅ Admin user created - Username: admin, Password: admin123');

        // Create a seller user
        const sellerPassword = await bcrypt.hash('seller123', 10);
        const seller = await User.create({
            username: 'seller',
            password: sellerPassword,
            full_name: 'Satıcı',
            role: 'seller',
            assigned_kiosk_id: kiosk.kiosk_id,
            is_active: true
        });
        console.log('✅ Seller user created - Username: seller, Password: seller123');

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run only if called directly
if (require.main === module) {
    const {
        sequelize
    } = require('../config/database');
    sequelize.authenticate().then(() => {
        seedDatabase();
    });
}

module.exports = seedDatabase;