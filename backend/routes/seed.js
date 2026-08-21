const express = require('express');
const router = express.Router();
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

// Seed endpoint - protected by a secret key so it can't be triggered by anyone
// who discovers the URL. Set SEED_SECRET in Railway env vars and send it as
// the `x-seed-secret` header when calling this endpoint.
router.post('/run', async (req, res) => {
    const seedSecret = process.env.SEED_SECRET;

    // Refuse to run unless a secret is configured on the server AND matches
    if (!seedSecret) {
        return res.status(503).json({
            success: false,
            message: 'Seed endpoint deaktivdir (SEED_SECRET təyin edilməyib).'
        });
    }

    if (req.headers['x-seed-secret'] !== seedSecret) {
        return res.status(401).json({
            success: false,
            message: 'Yanlış seed açarı.'
        });
    }

    try {
        console.log('🌱 Seeding database via API...');

        // Delete all existing data (order matters due to FKs)
        await KioskProduct.destroy({
            where: {}
        });
        await Product.destroy({
            where: {}
        });
        await User.destroy({
            where: {}
        });
        await Kiosk.destroy({
            where: {}
        });

        // Create kiosk
        const kiosk = await Kiosk.create({
            kiosk_name: 'Kiosk A',
            is_active: true
        });

        // Create admin (password is hashed automatically by User model hook)
        await User.create({
            username: 'admin',
            password: 'admin123',
            full_name: 'Admin User',
            role: 'admin',
            is_active: true
        });

        // Create seller (password is hashed automatically by User model hook)
        await User.create({
            username: 'seller',
            password: 'seller123',
            full_name: 'Seller User',
            role: 'seller',
            assigned_kiosk_id: kiosk.kiosk_id,
            is_active: true
        });

        // Create sample products and assign them to the kiosk
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

        res.json({
            success: true,
            message: 'Database seeded successfully',
            credentials: {
                admin: {
                    username: 'admin',
                    password: 'admin123'
                },
                seller: {
                    username: 'seller',
                    password: 'seller123',
                    kiosk: 'Kiosk A'
                }
            },
            productsCreated: SAMPLE_PRODUCTS.length
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({
            success: false,
            message: 'Seed failed: ' + error.message
        });
    }
});

module.exports = router;