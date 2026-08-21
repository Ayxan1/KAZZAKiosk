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

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const {
            kioskId,
            startDate,
            endDate
        } = req.query;

        const whereClause = {};

        if (kioskId) {
            whereClause.kiosk_id = kioskId;
        }

        if (startDate && endDate) {
            whereClause.sale_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

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
                'product_id',
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
            group: ['product_id', 'product.product_id', 'product.name', 'product.product_code'],
            order: [
                [sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']
            ],
            limit: 10,
            raw: false
        });

        // Sales by kiosk (if admin)
        let kioskStats = null;
        if (!kioskId) {
            kioskStats = await Sale.findAll({
                where: whereClause,
                attributes: [
                    'kiosk_id',
                    [sequelize.fn('COUNT', sequelize.col('sale_id')), 'total_sales'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
                ],
                include: [{
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                }],
                group: ['kiosk_id', 'kiosk.kiosk_id', 'kiosk.kiosk_name'],
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
            kioskId,
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

        const whereClause = {
            sale_date: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        };

        if (kioskId) {
            whereClause.kiosk_id = kioskId;
        }

        // Group by day, week, or month
        let dateFormat;
        switch (groupBy) {
            case 'day':
                dateFormat = '%Y-%m-%d';
                break;
            case 'week':
                dateFormat = '%Y-%W';
                break;
            case 'month':
                dateFormat = '%Y-%m';
                break;
            default:
                dateFormat = '%Y-%m-%d';
        }

        const salesReport = await Sale.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('sale_date')), 'period'],
                [sequelize.fn('COUNT', sequelize.col('sale_id')), 'total_sales'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
                [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_sale']
            ],
            group: [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('sale_date'))],
            order: [
                [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('sale_date')), 'ASC']
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
exports.getSellerPerformance = async (req, res) => {
    try {
        const {
            kioskId,
            startDate,
            endDate
        } = req.query;

        const whereClause = {};

        if (kioskId) {
            whereClause.kiosk_id = kioskId;
        }

        if (startDate && endDate) {
            whereClause.sale_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

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