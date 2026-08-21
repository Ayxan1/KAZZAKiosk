const {
    Sale,
    SaleItem,
    Product,
    KioskProduct,
    Kiosk,
    User
} = require('../models');
const {
    sequelize
} = require('../config/database');
const {
    Op
} = require('sequelize');

// Create a new sale
exports.createSale = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            kiosk_id,
            items,
            payment_method
        } = req.body;

        // Validate input
        if (!kiosk_id || !items || items.length === 0 || !payment_method) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Kiosk, məhsullar və ödəniş üsulu tələb olunur.'
            });
        }

        let totalAmount = 0;
        const saleItems = [];

        // Process each item
        for (const item of items) {
            const {
                product_id,
                quantity
            } = item;

            // Get product from kiosk
            const kioskProduct = await KioskProduct.findOne({
                where: {
                    kiosk_id,
                    product_id
                },
                include: [{
                    model: Product,
                    as: 'product'
                }]
            });

            if (!kioskProduct) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Məhsul tapılmadı: ${product_id}`
                });
            }

            // Check stock
            if (kioskProduct.stock_quantity < quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Kifayət qədər stok yoxdur: ${kioskProduct.product.name}. Mövcud: ${kioskProduct.stock_quantity}`
                });
            }

            const subtotal = parseFloat(kioskProduct.price) * quantity;
            totalAmount += subtotal;

            saleItems.push({
                product_id,
                quantity,
                unit_price: kioskProduct.price,
                subtotal
            });

            // Decrease stock
            await kioskProduct.update({
                stock_quantity: kioskProduct.stock_quantity - quantity
            }, {
                transaction
            });
        }

        // Create sale
        const sale = await Sale.create({
            kiosk_id,
            seller_id: req.user.user_id,
            total_amount: totalAmount,
            payment_method,
            sale_date: new Date()
        }, {
            transaction
        });

        // Create sale items
        for (const item of saleItems) {
            await SaleItem.create({
                sale_id: sale.sale_id,
                ...item
            }, {
                transaction
            });
        }

        await transaction.commit();

        const result = await Sale.findByPk(sale.sale_id, {
            include: [{
                    model: SaleItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                },
                {
                    model: Kiosk,
                    as: 'kiosk'
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: {
                        exclude: ['password']
                    }
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Satış uğurla tamamlandı.',
            sale: result
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get sales for a kiosk
exports.getKioskSales = async (req, res) => {
    try {
        const {
            kioskId
        } = req.params;
        const {
            startDate,
            endDate,
            page = 1,
            limit = 20
        } = req.query;

        const whereClause = {
            kiosk_id: kioskId
        };

        if (startDate && endDate) {
            whereClause.sale_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const offset = (page - 1) * limit;

        const {
            count,
            rows: sales
        } = await Sale.findAndCountAll({
            where: whereClause,
            include: [{
                    model: SaleItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['user_id', 'username', 'full_name']
                }
            ],
            order: [
                ['sale_date', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            sales
        });
    } catch (error) {
        console.error('Get kiosk sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get all sales (Admin only)
exports.getAllSales = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            kioskId,
            page = 1,
            limit = 20
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

        const offset = (page - 1) * limit;

        const {
            count,
            rows: sales
        } = await Sale.findAndCountAll({
            where: whereClause,
            include: [{
                    model: Kiosk,
                    as: 'kiosk'
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['user_id', 'username', 'full_name']
                }
            ],
            order: [
                ['sale_date', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            sales
        });
    } catch (error) {
        console.error('Get all sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get single sale
exports.getSale = async (req, res) => {
    try {
        const {
            saleId
        } = req.params;

        const sale = await Sale.findByPk(saleId, {
            include: [{
                    model: Kiosk,
                    as: 'kiosk'
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: {
                        exclude: ['password']
                    }
                }
            ]
        });

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Satış tapılmadı.'
            });
        }

        res.json({
            success: true,
            sale
        });
    } catch (error) {
        console.error('Get sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};