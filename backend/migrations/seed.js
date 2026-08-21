require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
    User,
    Kiosk
} = require('../models');

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');

        // DELETE ALL EXISTING DATA
        console.log('🗑️  Deleting all existing users...');
        await User.destroy({
            where: {},
            truncate: false
        });

        console.log('🗑️  Deleting all existing kiosks...');
        await Kiosk.destroy({
            where: {},
            truncate: false
        });

        console.log('✅ Old data cleaned!');

        // CREATE NEW KIOSK
        const kiosk = await Kiosk.create({
            kiosk_name: 'Kiosk A',
            is_active: true
        });
        console.log('✅ Kiosk created:', kiosk.kiosk_name);

        // CREATE ADMIN USER (password hashed automatically by model hook)
        const admin = await User.create({
            username: 'admin',
            password: 'admin123',
            full_name: 'Admin User',
            role: 'admin',
            is_active: true
        });
        console.log('✅ Admin created - Username: admin | Password: admin123');

        // CREATE SELLER USER (password hashed automatically by model hook)
        const seller = await User.create({
            username: 'seller',
            password: 'seller123',
            full_name: 'Seller User',
            role: 'seller',
            assigned_kiosk_id: kiosk.kiosk_id,
            is_active: true
        });
        console.log('✅ Seller created - Username: seller | Password: seller123 | Kiosk:', kiosk.kiosk_name);

        console.log('🎉 Database seeded successfully!');
        console.log('');
        console.log('📝 Login Credentials:');
        console.log('   Admin  → admin / admin123');
        console.log('   Seller → seller / seller123 (Kiosk A)');

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