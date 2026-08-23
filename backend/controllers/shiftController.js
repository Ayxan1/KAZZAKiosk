const {
    Shift,
    Sale,
    SaleItem,
    Product,
    User,
    Kiosk
} = require('../models');
const {
    Op
} = require('sequelize');
const {
    logActivity
} = require('../utils/activityLogger');

// Find the most recent shift for a user (open or closed). This represents
// "the current or last shift" used to gate sales and compute summaries.
async function getLatestShift(userId) {
    return Shift.findOne({
        where: {
            user_id: userId
        },
        order: [
            ['taken_over_at', 'DESC']
        ]
    });
}

// Is this user currently allowed to sell? (has an open shift, i.e. took over
// and hasn't handed over yet)
async function hasOpenShift(userId) {
    const shift = await getLatestShift(userId);
    return !!(shift && !shift.handed_over_at);
}

// GET /api/shifts/summary - current user's shift status + sales summary
// since the shift's taken_over_at (or up to handed_over_at if closed).
exports.getShiftSummary = async (req, res) => {
    try {
        const shift = await getLatestShift(req.user.user_id);

        if (!shift) {
            return res.json({
                success: true,
                isOpen: false,
                shift: null,
                summary: {
                    salesCount: 0,
                    totalAmount: 0,
                    profit: 0
                }
            });
        }

        const periodStart = shift.taken_over_at;
        const periodEnd = shift.handed_over_at || new Date();

        const sales = await Sale.findAll({
            where: {
                seller_id: req.user.user_id,
                kiosk_id: shift.kiosk_id,
                sale_date: {
                    [Op.gte]: periodStart,
                    [Op.lte]: periodEnd
                }
            }
        });

        const totalAmount = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

        res.json({
            success: true,
            isOpen: !shift.handed_over_at,
            shift,
            summary: {
                salesCount: sales.length,
                totalAmount,
                // Profit tracking requires per-product cost price, which
                // isn't captured yet - using total sales as a placeholder.
                profit: totalAmount
            }
        });
    } catch (error) {
        console.error('Get shift summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// POST /api/shifts/take-over - "Təhvil Al"
exports.takeOverShift = async (req, res) => {
    try {
        const kioskId = req.user.assigned_kiosk_id;
        if (!kioskId) {
            return res.status(400).json({
                success: false,
                message: 'Sizə heç bir kiosk təyin edilməyib.'
            });
        }

        if (await hasOpenShift(req.user.user_id)) {
            return res.status(400).json({
                success: false,
                message: 'Artıq növbəni təhvil almısınız.'
            });
        }

        const shift = await Shift.create({
            user_id: req.user.user_id,
            kiosk_id: kioskId,
            taken_over_at: new Date()
        });

        await logActivity(
            req.user.user_id,
            'SHIFT_TAKEOVER',
            `${req.user.full_name} növbəni təhvil aldı.`,
            kioskId
        );

        res.status(201).json({
            success: true,
            message: 'Növbə uğurla təhvil alındı.',
            shift
        });
    } catch (error) {
        console.error('Take over shift error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// POST /api/shifts/hand-over - "Təhvil Ver"
exports.handOverShift = async (req, res) => {
    try {
        const shift = await getLatestShift(req.user.user_id);

        if (!shift || shift.handed_over_at) {
            return res.status(400).json({
                success: false,
                message: 'Aktiv növbə tapılmadı. Əvvəlcə növbəni təhvil almalısınız.'
            });
        }

        await shift.update({
            handed_over_at: new Date()
        });

        await logActivity(
            req.user.user_id,
            'SHIFT_HANDOVER',
            `${req.user.full_name} növbəni təhvil verdi.`,
            shift.kiosk_id
        );

        res.json({
            success: true,
            message: 'Növbə uğurla təhvil verildi.',
            shift
        });
    } catch (error) {
        console.error('Hand over shift error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// GET /api/shifts/active (Admin only) - currently open shifts across all
// kiosks, so admins can see who is holding each register right now.
exports.getActiveShifts = async (req, res) => {
    try {
        const shifts = await Shift.findAll({
            where: {
                handed_over_at: null
            },
            include: [{
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'username', 'full_name']
                },
                {
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                }
            ],
            order: [
                ['taken_over_at', 'DESC']
            ]
        });

        res.json({
            success: true,
            count: shifts.length,
            shifts
        });
    } catch (error) {
        console.error('Get active shifts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// GET /api/shifts/history (Admin only) - all shifts (open + closed),
// optionally filtered by kiosk, newest first, each with its own sales
// summary so the admin can review who handed over what and when.
exports.getShiftHistory = async (req, res) => {
    try {
        const {
            kioskId
        } = req.query;

        const whereClause = {};
        if (kioskId) whereClause.kiosk_id = kioskId;

        const shifts = await Shift.findAll({
            where: whereClause,
            include: [{
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'username', 'full_name']
                },
                {
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                }
            ],
            order: [
                ['taken_over_at', 'DESC']
            ],
            limit: 200
        });

        const shiftsWithSummary = await Promise.all(shifts.map(async (shift) => {
            const periodStart = shift.taken_over_at;
            const periodEnd = shift.handed_over_at || new Date();

            const sales = await Sale.findAll({
                where: {
                    seller_id: shift.user_id,
                    kiosk_id: shift.kiosk_id,
                    sale_date: {
                        [Op.gte]: periodStart,
                        [Op.lte]: periodEnd
                    }
                },
                attributes: ['total_amount']
            });

            const totalAmount = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

            return {
                ...shift.toJSON(),
                summary: {
                    salesCount: sales.length,
                    totalAmount
                }
            };
        }));

        res.json({
            success: true,
            count: shiftsWithSummary.length,
            shifts: shiftsWithSummary
        });
    } catch (error) {
        console.error('Get shift history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// GET /api/shifts/:shiftId/sales (Admin only) - full list of sales made
// during a specific shift's window, for drill-down review.
exports.getShiftSales = async (req, res) => {
    try {
        const {
            shiftId
        } = req.params;

        const shift = await Shift.findByPk(shiftId);
        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Növbə tapılmadı.'
            });
        }

        const periodStart = shift.taken_over_at;
        const periodEnd = shift.handed_over_at || new Date();

        const sales = await Sale.findAll({
            where: {
                seller_id: shift.user_id,
                kiosk_id: shift.kiosk_id,
                sale_date: {
                    [Op.gte]: periodStart,
                    [Op.lte]: periodEnd
                }
            },
            include: [{
                model: SaleItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['product_id', 'name']
                }]
            }],
            order: [
                ['sale_date', 'DESC']
            ]
        });

        const totalAmount = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

        res.json({
            success: true,
            shift,
            count: sales.length,
            totalAmount,
            sales
        });
    } catch (error) {
        console.error('Get shift sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Exported for use by salesController to gate sale creation.
exports.hasOpenShift = hasOpenShift;