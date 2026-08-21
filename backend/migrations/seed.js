const bcrypt = require('bcryptjs');
const {
    User,
    Kiosk
} = require('../models');

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');

        // Find or create default kiosk
        let kiosk = await Kiosk.findOne({
            where: {
                kiosk_name: 'Kiosk A'
            }
        });
        if (!kiosk) {
            kiosk = await Kiosk.create({
                kiosk_name: 'Kiosk A'
            });
            console.log('✅ Default kiosk created:', kiosk.kiosk_name);
        } else {
            console.log('ℹ️  Kiosk already exists:', kiosk.kiosk_name);
        }

        // Check if admin exists
        let admin = await User.findOne({
            where: {
                username: 'admin'
            }
        });
        if (!admin) {
            const adminPassword = await bcrypt.hash('admin123', 10);
            admin = await User.create({
                username: 'admin',
                password: adminPassword,
                full_name: 'Admin',
                role: 'admin',
                is_active: true
            });
            console.log('✅ Admin user created - Username: admin, Password: admin123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Check if seller exists
        let seller = await User.findOne({
            where: {
                username: 'seller'
            }
        });
        if (!seller) {
            const sellerPassword = await bcrypt.hash('seller123', 10);
            seller = await User.create({
                username: 'seller',
                password: sellerPassword,
                full_name: 'Satıcı',
                role: 'seller',
                assigned_kiosk_id: kiosk.kiosk_id,
                is_active: true
            });
            console.log('✅ Seller user created - Username: seller, Password: seller123');
        } else {
            console.log('ℹ️  Seller user already exists');
        }

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