const {
    Product,
    KioskProduct,
    ProductHistory,
    Kiosk,
    User
} = require('../models');
const {
    sequelize
} = require('../config/database');
const {
    Op
} = require('sequelize');
const {
    logActivity
} = require('../utils/activityLogger');

async function findProductByCodeOrBarcode(product_code, barcode) {
    if (barcode) {
        const byBarcode = await Product.findOne({
            where: {
                barcode
            }
        });
        if (byBarcode) return byBarcode;
    }

    if (product_code) {
        return Product.findOne({
            where: {
                product_code
            }
        });
    }

    return null;
}

// Lookup a catalog product by barcode or code so the admin add form can
// auto-fill the name and restock instead of creating a duplicate.
exports.lookupProduct = async (req, res) => {
    try {
        const {
            barcode,
            product_code,
            kioskId
        } = req.query;

        if (!barcode && !product_code) {
            return res.status(400).json({
                success: false,
                message: 'Barkod və ya kod tələb olunur.'
            });
        }

        const product = await findProductByCodeOrBarcode(product_code, barcode);
        if (!product) {
            return res.json({
                success: true,
                found: false
            });
        }

        let selectedKioskProduct = null;
        if (kioskId) {
            selectedKioskProduct = await KioskProduct.findOne({
                where: {
                    kiosk_id: kioskId,
                    product_id: product.product_id
                }
            });
        }

        let priceSource = selectedKioskProduct;
        if (!priceSource) {
            priceSource = await KioskProduct.findOne({
                where: {
                    product_id: product.product_id
                }
            });
        }

        res.json({
            success: true,
            found: true,
            product: {
                product_id: product.product_id,
                name: product.name,
                product_code: product.product_code,
                barcode: product.barcode,
                price: priceSource ? parseFloat(priceSource.price) : null,
                stock_quantity: selectedKioskProduct ? selectedKioskProduct.stock_quantity : null,
                existsInKiosk: !!selectedKioskProduct
            }
        });
    } catch (error) {
        console.error('Lookup product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get products across ALL kiosks (Admin only) - used for the admin inventory table
exports.getAllKioskProducts = async (req, res) => {
    try {
        const {
            kioskId,
            search
        } = req.query;

        const whereClause = {};
        if (kioskId) {
            whereClause.kiosk_id = kioskId;
        }

        const productWhere = {};
        if (search) {
            productWhere[Op.or] = [{
                    name: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    product_code: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    barcode: {
                        [Op.iLike]: `%${search}%`
                    }
                }
            ];
        }

        const products = await KioskProduct.findAll({
            where: whereClause,
            include: [{
                    model: Product,
                    as: 'product',
                    where: Object.keys(productWhere).length > 0 ? productWhere : undefined
                },
                {
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                }
            ],
            order: [
                [{
                    model: Kiosk,
                    as: 'kiosk'
                }, 'kiosk_name', 'ASC'],
                [{
                    model: Product,
                    as: 'product'
                }, 'name', 'ASC']
            ]
        });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get all kiosk products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get products for a kiosk
exports.getKioskProducts = async (req, res) => {
    try {
        const {
            kioskId
        } = req.params;
        const {
            search
        } = req.query;

        const whereClause = {
            kiosk_id: kioskId
        };
        const productWhere = {};

        // Search by name, code, or barcode
        if (search) {
            productWhere[Op.or] = [{
                    name: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    product_code: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    barcode: {
                        [Op.iLike]: `%${search}%`
                    }
                }
            ];
        }

        const products = await KioskProduct.findAll({
            where: whereClause,
            include: [{
                model: Product,
                as: 'product',
                where: Object.keys(productWhere).length > 0 ? productWhere : undefined
            }],
            order: [
                [{
                    model: Product,
                    as: 'product'
                }, 'name', 'ASC']
            ]
        });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get kiosk products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Add product to kiosk
exports.addProductToKiosk = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            kioskId
        } = req.params;
        const {
            name,
            product_code,
            barcode,
            price,
            stock_quantity
        } = req.body;

        if (price === undefined || stock_quantity === undefined) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Qiymət və stok miqdarı tələb olunur.'
            });
        }

        const addedQty = parseInt(stock_quantity, 10);
        if (Number.isNaN(addedQty) || addedQty < 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Stok miqdarı etibarsızdır.'
            });
        }

        let product = await findProductByCodeOrBarcode(product_code, barcode);

        if (!product) {
            if (!name) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Yeni məhsul üçün ad tələb olunur.'
                });
            }

            product = await Product.create({
                name,
                product_code,
                barcode
            }, {
                transaction
            });
        }

        const existingKioskProduct = await KioskProduct.findOne({
            where: {
                kiosk_id: kioskId,
                product_id: product.product_id
            }
        });

        if (existingKioskProduct) {
            const oldStock = parseInt(existingKioskProduct.stock_quantity, 10) || 0;
            const newStock = oldStock + addedQty;
            const productName = product.name;

            await existingKioskProduct.update({
                stock_quantity: newStock
            }, {
                transaction
            });

            await ProductHistory.create({
                kiosk_id: kioskId,
                product_id: product.product_id,
                user_id: req.user.user_id,
                action_type: 'EDIT_STOCK',
                old_value: String(oldStock),
                new_value: String(newStock),
                description: `Stok artırıldı: ${oldStock} → ${newStock} (+${addedQty})`
            }, {
                transaction
            });

            await transaction.commit();

            await logActivity(
                req.user.user_id,
                'UPDATE_PRODUCT',
                `${req.user.full_name} "${productName}" məhsulunun stokunu ${addedQty} ədəd artırdı.`,
                kioskId
            );

            const result = await KioskProduct.findByPk(existingKioskProduct.kiosk_product_id, {
                include: [{
                    model: Product,
                    as: 'product'
                }]
            });

            return res.json({
                success: true,
                updated: true,
                message: `"${productName}" məhsulunun stoku ${addedQty} ədəd artırıldı. Yeni stok: ${newStock}.`,
                product: result
            });
        }

        // Add product to kiosk
        const kioskProduct = await KioskProduct.create({
            kiosk_id: kioskId,
            product_id: product.product_id,
            price,
            stock_quantity
        }, {
            transaction
        });

        // Log product history
        await ProductHistory.create({
            kiosk_id: kioskId,
            product_id: product.product_id,
            user_id: req.user.user_id,
            action_type: 'ADD',
            new_value: JSON.stringify({
                name,
                product_code,
                barcode,
                price,
                stock_quantity
            }),
            description: `Məhsul əlavə edildi: ${product.name}`
        }, {
            transaction
        });

        await transaction.commit();

        await logActivity(
            req.user.user_id,
            'CREATE_PRODUCT',
            `${req.user.full_name} "${product.name}" məhsulunu kioska əlavə etdi.`,
            kioskId
        );

        const result = await KioskProduct.findByPk(kioskProduct.kiosk_product_id, {
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Məhsul uğurla əlavə edildi.',
            product: result
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Add product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Update product in kiosk
exports.updateKioskProduct = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            kioskId,
            productId
        } = req.params;
        const {
            name,
            product_code,
            barcode,
            price,
            stock_quantity
        } = req.body;

        const kioskProduct = await KioskProduct.findOne({
            where: {
                kiosk_id: kioskId,
                product_id: productId
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
                message: 'Məhsul tapılmadı.'
            });
        }

        const product = kioskProduct.product;
        const changes = [];

        // Track changes
        if (name && name !== product.name) {
            await ProductHistory.create({
                kiosk_id: kioskId,
                product_id: productId,
                user_id: req.user.user_id,
                action_type: 'EDIT_NAME',
                old_value: product.name,
                new_value: name,
                description: `Ad dəyişdirildi: ${product.name} → ${name}`
            }, {
                transaction
            });
            changes.push('ad');
        }

        if (product_code && product_code !== product.product_code) {
            await ProductHistory.create({
                kiosk_id: kioskId,
                product_id: productId,
                user_id: req.user.user_id,
                action_type: 'EDIT_CODE',
                old_value: product.product_code,
                new_value: product_code,
                description: `Kod dəyişdirildi`
            }, {
                transaction
            });
            changes.push('kod');
        }

        if (barcode && barcode !== product.barcode) {
            await ProductHistory.create({
                kiosk_id: kioskId,
                product_id: productId,
                user_id: req.user.user_id,
                action_type: 'EDIT_BARCODE',
                old_value: product.barcode,
                new_value: barcode,
                description: `Barkod dəyişdirildi`
            }, {
                transaction
            });
            changes.push('barkod');
        }

        if (price !== undefined && parseFloat(price) !== parseFloat(kioskProduct.price)) {
            await ProductHistory.create({
                kiosk_id: kioskId,
                product_id: productId,
                user_id: req.user.user_id,
                action_type: 'EDIT_PRICE',
                old_value: kioskProduct.price.toString(),
                new_value: price.toString(),
                description: `Qiymət dəyişdirildi: ${kioskProduct.price} AZN → ${price} AZN`
            }, {
                transaction
            });
            changes.push('qiymət');
        }

        if (stock_quantity !== undefined && parseInt(stock_quantity) !== parseInt(kioskProduct.stock_quantity)) {
            await ProductHistory.create({
                kiosk_id: kioskId,
                product_id: productId,
                user_id: req.user.user_id,
                action_type: 'EDIT_STOCK',
                old_value: kioskProduct.stock_quantity.toString(),
                new_value: stock_quantity.toString(),
                description: `Stok dəyişdirildi: ${kioskProduct.stock_quantity} → ${stock_quantity}`
            }, {
                transaction
            });
            changes.push('stok');
        }

        // Update product
        await product.update({
            name,
            product_code,
            barcode
        }, {
            transaction
        });

        // Update kiosk product
        await kioskProduct.update({
            price,
            stock_quantity
        }, {
            transaction
        });

        await transaction.commit();

        if (changes.length > 0) {
            await logActivity(
                req.user.user_id,
                'UPDATE_PRODUCT',
                `${req.user.full_name} "${product.name}" məhsulunda dəyişiklik etdi: ${changes.join(', ')}.`,
                kioskId
            );
        }

        const result = await KioskProduct.findOne({
            where: {
                kiosk_id: kioskId,
                product_id: productId
            },
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        res.json({
            success: true,
            message: `Məhsul uğurla yeniləndi. Dəyişikliklər: ${changes.join(', ')}`,
            product: result
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Delete product from kiosk
exports.deleteKioskProduct = async (req, res) => {
    try {
        const {
            kioskId,
            productId
        } = req.params;

        const kioskProduct = await KioskProduct.findOne({
            where: {
                kiosk_id: kioskId,
                product_id: productId
            },
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        if (!kioskProduct) {
            return res.status(404).json({
                success: false,
                message: 'Məhsul tapılmadı.'
            });
        }

        const productName = kioskProduct.product?.name || productId;

        await kioskProduct.destroy();

        await logActivity(
            req.user.user_id,
            'DELETE_PRODUCT',
            `${req.user.full_name} "${productName}" məhsulunu kioskdan sildi.`,
            kioskId
        );

        res.json({
            success: true,
            message: 'Məhsul kioskdan silindi.'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};

// Get product history for admin
exports.getProductHistory = async (req, res) => {
    try {
        const {
            kioskId
        } = req.query;
        const {
            startDate,
            endDate
        } = req.query;

        const whereClause = {};

        if (kioskId) {
            whereClause.kiosk_id = kioskId;
        }

        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const history = await ProductHistory.findAll({
            where: whereClause,
            include: [{
                    model: Kiosk,
                    as: 'kiosk',
                    attributes: ['kiosk_id', 'kiosk_name']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['product_id', 'name', 'product_code']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'username', 'full_name']
                }
            ],
            order: [
                ['created_at', 'DESC']
            ],
            limit: 100
        });

        res.json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        console.error('Get product history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xətası.',
            error: error.message
        });
    }
};