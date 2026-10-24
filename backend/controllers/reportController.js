const {
    Sale,
    SaleItem,
    Product,
    Kiosk,
    User,
    KioskProduct
} = require('../models');
const {
    sequelize
} = require('../config/database');
const {
    Op
} = require('sequelize');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bakuToday() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Baku'
    }).format(new Date());
}

// Date inputs are calendar days in Asia/Baku (UTC+4, no DST), not UTC midnights.
function buildSaleDateRange(startDate, endDate) {
    const today = bakuToday();

    if ((startDate && !DATE_RE.test(startDate)) || (endDate && !DATE_RE.test(endDate))) {
        return {
            error: 'Yanlış tarix formatı.'
        };
    }

    let start = startDate || null;
    let end = endDate || null;

    if (start && start > today) start = today;
    if (end && end > today) end = today;

    if (start && end && start > end) {
        return {
            error: 'Başlanğıc tarixi son tarixdən böyük ola bilməz.'
        };
    }

    const saleDate = {};
    if (start) {
        saleDate[Op.gte] = new Date(`${start}T00:00:00.000+04:00`);
    }
    if (end) {
        saleDate[Op.lte] = new Date(`${end}T23:59:59.999+04:00`);
    }

    return {
        start,
        end,
        saleDate: Object.keys(saleDate).length ? saleDate : null
    };
}

function applySaleFilters(query) {
    const {
        kioskId,
        startDate,
        endDate
    } = query;
    const range = buildSaleDateRange(startDate, endDate);
    if (range.error) return range;

    const whereClause = {};
    if (kioskId) whereClause.kiosk_id = kioskId;
    if (range.saleDate) whereClause.sale_date = range.saleDate;
    return {
        whereClause
    };
}

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const filters = applySaleFilters(req.query);
        if (filters.error) {
            return res.status(400).json({
                success: false,
                message: filters.error
            });
        }
        const {
            whereClause
        } = filters;

        // Total sales
        const totalSales = await Sale.count({
            where: whereClause
        });

        // Total revenue
        const revenueResult = await Sale.findOne({
            where: whereClause,
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
            ],
            raw: true
        });

        // Sales by payment method
        const paymentMethodStats = await Sale.findAll({
            where: whereClause,
            attributes: [
                'payment_method',
                [sequelize.fn('COUNT', sequelize.col('sale_id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
            ],
            group: ['payment_method'],
            raw: true
        });

        // Top selling products
        const topProducts = await SaleItem.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
                [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_revenue']
            ],
            include: [{
                    model: Sale,
                    as: 'sale',
                    where: whereClause,
                    attributes: []
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['product_id', 'name', 'product_code']
                }
            ],
            group: ['product.product_id', 'product.name', 'product.product_code'],
            order: [
                [sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']
            ],
            limit: 10,
            raw: false
        });

        // Sales by kiosk (if admin and not filtered to one kiosk)
        let kioskStats = null;
        if (!req.query.kioskId) {
            kioskStats = await Sale.findAll({
                where: whereClause,
                attributes: [
                    [sequelize.col('Sale.kiosk_id'), 'kiosk_id'],
                    [sequelize.fn('COUNT', sequelize.col('sale_id')), 'total_sales'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
                ],
                include: [{
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                }],
                group: ['Sale.kiosk_id', 'kiosk.kiosk_id', 'kiosk.kiosk_name'],
                order: [
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']
                ],
                raw: false
            });
        }

        res.json({
            success: true,
            stats: {
                totalSales,
                totalRevenue: parseFloat(revenueResult?.total_revenue || 0),
                paymentMethods: paymentMethodStats,
                topProducts,
                ...(kioskStats && {
                    kioskStats
                })
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get sales report
exports.getSalesReport = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            groupBy = 'day'
        } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Tarix aralığı tələb olunur.'
            });
        }

        const filters = applySaleFilters(req.query);
        if (filters.error) {
            return res.status(400).json({
                success: false,
                message: filters.error
            });
        }
        const {
            whereClause
        } = filters;

        const bucket = ['day', 'week', 'month'].includes(groupBy) ? groupBy : 'day';
        const periodExpr = sequelize.literal(
            `DATE_TRUNC('${bucket}', "Sale"."sale_date" AT TIME ZONE 'Asia/Baku')`
        );
        const periodLabel = sequelize.literal(
            `TO_CHAR(DATE_TRUNC('${bucket}', "Sale"."sale_date" AT TIME ZONE 'Asia/Baku'), 'YYYY-MM-DD')`
        );

        const salesReport = await Sale.findAll({
            where: whereClause,
            attributes: [
                [periodLabel, 'period'],
                [sequelize.fn('COUNT', sequelize.col('Sale.sale_id')), 'total_sales'],
                [sequelize.fn('SUM', sequelize.col('Sale.total_amount')), 'total_revenue'],
                [sequelize.fn('AVG', sequelize.col('Sale.total_amount')), 'avg_sale']
            ],
            group: [periodExpr],
            order: [
                [periodExpr, 'ASC']
            ],
            raw: true
        });

        res.json({
            success: true,
            report: salesReport
        });
    } catch (error) {
        console.error('Get sales report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
    try {
        const {
            kioskId,
            threshold = 10
        } = req.query;

        const whereClause = {
            stock_quantity: {
                [Op.lte]: parseInt(threshold)
            }
        };

        if (kioskId) {
            whereClause.kiosk_id = kioskId;
        }

        const lowStockProducts = await KioskProduct.findAll({
            where: whereClause,
            include: [{
                    model: Product,
                    as: 'product'
                },
                {
                    model: Kiosk,
                    as: 'kiosk'
                }
            ],
            order: [
                ['stock_quantity', 'ASC']
            ]
        });

        res.json({
            success: true,
            count: lowStockProducts.length,
            products: lowStockProducts
        });
    } catch (error) {
        console.error('Get low stock products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get seller performance
exports.getSalesDetails = async (req, res) => {
    try {
        const filters = applySaleFilters(req.query);
        if (filters.error) {
            return res.status(400).json({
                success: false,
                message: filters.error
            });
        }
        const {
            whereClause
        } = filters;

        const sales = await Sale.findAll({
            where: whereClause,
            include: [{
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['user_id', 'username', 'full_name']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['product_id', 'name', 'product_code']
                    }]
                }
            ],
            order: [
                ['sale_date', 'DESC']
            ],
            limit: 500
        });

        const sellers = await Sale.findAll({
            where: whereClause,
            attributes: [
                'seller_id',
                [sequelize.fn('COUNT', sequelize.col('Sale.sale_id')), 'total_sales'],
                [sequelize.fn('SUM', sequelize.col('Sale.total_amount')), 'total_revenue']
            ],
            include: [{
                model: User,
                as: 'seller',
                attributes: ['user_id', 'username', 'full_name']
            }],
            group: ['Sale.seller_id', 'seller.user_id', 'seller.username', 'seller.full_name'],
            order: [
                [sequelize.fn('SUM', sequelize.col('Sale.total_amount')), 'DESC']
            ]
        });

        res.json({
            success: true,
            count: sales.length,
            sales,
            sellers
        });
    } catch (error) {
        console.error('Get sales details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

exports.getSellerPerformance = async (req, res) => {
    try {
        const filters = applySaleFilters(req.query);
        if (filters.error) {
            return res.status(400).json({
                success: false,
                message: filters.error
            });
        }
        const {
            whereClause
        } = filters;

        const sellerPerformance = await Sale.findAll({
            where: whereClause,
            attributes: [
                'seller_id',
                [sequelize.fn('COUNT', sequelize.col('sale_id')), 'total_sales'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
                [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_sale']
            ],
            include: [{
                model: User,
                as: 'seller',
                attributes: ['user_id', 'username', 'full_name']
            }],
            group: ['seller_id', 'seller.user_id', 'seller.username', 'seller.full_name'],
            order: [
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']
            ],
            raw: false
        });

        res.json({
            success: true,
            performance: sellerPerformance
        });
    } catch (error) {
        console.error('Get seller performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};