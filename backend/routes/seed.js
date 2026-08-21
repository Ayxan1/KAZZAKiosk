const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {
    User,
    Kiosk
} = require('../models');

// Seed endpoint - ONLY for development/initial setup
router.post('/run', async (req, res) => {
    try {
        console.log('🌱 Seeding database via API...');

        // Delete all existing data
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
            }
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