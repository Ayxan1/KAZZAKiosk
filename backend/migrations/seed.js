require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
    User,
    Kiosk,
    Product,
    KioskProduct
} = require('../models');

// Sample products created for the demo kiosk
const SAMPLE_PRODUCTS = [
    { name: 'Coca-Cola 0.5L', product_code: 'BEV-001', barcode: '5449000000996', price: 1.50, stock_quantity: 100 },
    { name: 'Su 0.5L', product_code: 'BEV-002', barcode: '5410013106031', price: 0.50, stock_quantity: 200 },
    { name: 'Fanta 0.5L', product_code: 'BEV-003', barcode: '5449000015364', price: 1.50, stock_quantity: 80 },
    { name: 'Lays Chips Original', product_code: 'SNK-001', barcode: '5411188112709', price: 2.00, stock_quantity: 60 },
    { name: 'Snickers', product_code: 'SNK-002', barcode: '5000159407236', price: 1.20, stock_quantity: 90 },
    { name: 'Bounty', product_code: 'SNK-003', barcode: '5000159459228', price: 1.20, stock_quantity: 70 },
    { name: 'Nescafe 3in1', product_code: 'HOT-001', barcode: '7613036101059', price: 0.80, stock_quantity: 150 },
    { name: 'Cay (Qara)', product_code: 'HOT-002', barcode: '4870204082930', price: 0.60, stock_quantity: 150 },
    { name: 'Alma', product_code: 'FRT-001', barcode: null, price: 1.00, stock_quantity: 50 },
    { name: 'Banan', product_code: 'FRT-002', barcode: null, price: 1.30, stock_quantity: 40 }
];

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');

        // DELETE ALL EXISTING DATA (order matters due to FKs)
        console.log('🗑️  Deleting all existing kiosk products...');
        await KioskProduct.destroy({
            where: {},
            truncate: false
        });

        console.log('🗑️  Deleting all existing products...');
        await Product.destroy({
            where: {},
            truncate: false
        });

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

        // CREATE SAMPLE PRODUCTS
        console.log('🛒 Creating sample products...');
        for (const item of SAMPLE_PRODUCTS) {
            const product = await Product.create({
                name: item.name,
                product_code: item.product_code,
                barcode: item.barcode
            });

            await KioskProduct.create({
                kiosk_id: kiosk.kiosk_id,
                product_id: product.product_id,
                price: item.price,
                stock_quantity: item.stock_quantity
            });
        }
        console.log(`✅ ${SAMPLE_PRODUCTS.length} sample products created`);

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