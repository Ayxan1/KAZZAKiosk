const {
    Kiosk,
    User,
    KioskProduct,
    Product
} = require('../models');
const {
    logActivity
} = require('../utils/activityLogger');

// Get all kiosks (Admin only)
exports.getAllKiosks = async (req, res) => {
    try {
        const kiosks = await Kiosk.findAll({
            include: [{
                model: User,
                as: 'users',
                attributes: {
                    exclude: ['password']
                }
            }],
            order: [
                ['kiosk_name', 'ASC']
            ]
        });

        res.json({
            success: true,
            count: kiosks.length,
            kiosks
        });
    } catch (error) {
        console.error('Get kiosks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get single kiosk
exports.getKiosk = async (req, res) => {
    try {
        const {
            kioskId
        } = req.params;

        const kiosk = await Kiosk.findByPk(kioskId, {
            include: [{
                    model: User,
                    as: 'users',
                    attributes: {
                        exclude: ['password']
                    }
                },
                {
                    model: KioskProduct,
                    as: 'kioskProducts',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                }
            ]
        });

        if (!kiosk) {
            return res.status(404).json({
                success: false,
                message: 'Kiosk tapılmadı.'
            });
        }

        res.json({
            success: true,
            kiosk
        });
    } catch (error) {
        console.error('Get kiosk error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Create kiosk (Admin only)
exports.createKiosk = async (req, res) => {
    try {
        const {
            kiosk_name
        } = req.body;

        if (!kiosk_name) {
            return res.status(400).json({
                success: false,
                message: 'Kiosk adı tələb olunur.'
            });
        }

        const kiosk = await Kiosk.create({
            kiosk_name
        });

        await logActivity(
            req.user.user_id,
            'CREATE_KIOSK',
            `${req.user.full_name} "${kiosk_name}" adlı kiosk yaratdı.`,
            kiosk.kiosk_id
        );

        res.status(201).json({
            success: true,
            message: 'Kiosk uğurla yaradıldı.',
            kiosk
        });
    } catch (error) {
        console.error('Create kiosk error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Update kiosk (Admin only)
exports.updateKiosk = async (req, res) => {
    try {
        const {
            kioskId
        } = req.params;
        const {
            kiosk_name,
            is_active
        } = req.body;

        const kiosk = await Kiosk.findByPk(kioskId);

        if (!kiosk) {
            return res.status(404).json({
                success: false,
                message: 'Kiosk tapılmadı.'
            });
        }

        await kiosk.update({
            kiosk_name,
            is_active
        });

        await logActivity(
            req.user.user_id,
            'UPDATE_KIOSK',
            `${req.user.full_name} "${kiosk_name}" kioskunu yenilədi (aktiv: ${is_active ? 'bəli' : 'xeyr'}).`,
            kioskId
        );

        res.json({
            success: true,
            message: 'Kiosk uğurla yeniləndi.',
            kiosk
        });
    } catch (error) {
        console.error('Update kiosk error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Delete kiosk (Admin only)
exports.deleteKiosk = async (req, res) => {
    try {
        const {
            kioskId
        } = req.params;

        const kiosk = await Kiosk.findByPk(kioskId);

        if (!kiosk) {
            return res.status(404).json({
                success: false,
                message: 'Kiosk tapılmadı.'
            });
        }

        await kiosk.destroy();

        res.json({
            success: true,
            message: 'Kiosk uğurla silindi.'
        });
    } catch (error) {
        console.error('Delete kiosk error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};