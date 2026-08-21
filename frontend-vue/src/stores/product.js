import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

// Flatten backend KioskProduct (with nested `product`) into a flat shape
// used by the views: { kiosk_product_id, product_id, product_name, product_code, barcode, price, stock_quantity }
function flattenKioskProduct(kp) {
    return {
        kiosk_product_id: kp.kiosk_product_id,
        product_id: kp.product_id,
        product_name: kp.product?.name,
        product_code: kp.product?.product_code,
        barcode: kp.product?.barcode,
        price: parseFloat(kp.price),
        stock_quantity: kp.stock_quantity
    }
}

// Same as flattenKioskProduct but also carries the kiosk name/id (used by the
// admin cross-kiosk inventory table).
function flattenAllKioskProduct(kp) {
    return {
        ...flattenKioskProduct(kp),
        kiosk_id: kp.kiosk_id,
        kiosk_name: kp.kiosk?.kiosk_name
    }
}

export const useProductStore = defineStore('product', () => {
    const products = ref([])
    const allProducts = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchProducts(kioskId, search = '') {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get(`/products/kiosk/${kioskId}`, {
                params: {
                    search
                }
            })
            products.value = (data.products || []).map(flattenKioskProduct)
        } catch (err) {
            error.value = err.message || 'Məhsullar yüklənə bilmədi'
            console.error('Məhsullar yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    // Admin only - products across all kiosks, optionally filtered
    async function fetchAllProducts(params = {}) {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get('/products/all', {
                params
            })
            allProducts.value = (data.products || []).map(flattenAllKioskProduct)
        } catch (err) {
            error.value = err.message || 'Məhsullar yüklənə bilmədi'
            console.error('Məhsullar yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    async function addProduct(kioskId, product) {
        error.value = null
        try {
            await apiClient.post(`/products/kiosk/${kioskId}`, {
                name: product.product_name,
                product_code: product.product_code || undefined,
                barcode: product.barcode || undefined,
                price: product.price,
                stock_quantity: product.stock_quantity
            })
            await fetchProducts(kioskId)
            return true
        } catch (err) {
            error.value = err.message || 'Məhsul əlavə edilə bilmədi'
            console.error('Məhsul əlavə edilə bilmədi:', err)
            return false
        }
    }

    async function updateProduct(kioskId, productId, updates) {
        error.value = null
        try {
            const payload = {}
            if (updates.product_name !== undefined) payload.name = updates.product_name
            if (updates.product_code !== undefined) payload.product_code = updates.product_code
            if (updates.barcode !== undefined) payload.barcode = updates.barcode
            if (updates.price !== undefined) payload.price = updates.price
            if (updates.stock_quantity !== undefined) payload.stock_quantity = updates.stock_quantity

            await apiClient.put(`/products/kiosk/${kioskId}/product/${productId}`, payload)
            await fetchProducts(kioskId)
            return true
        } catch (err) {
            error.value = err.message || 'Məhsul yenilənə bilmədi'
            console.error('Məhsul yenilənə bilmədi:', err)
            return false
        }
    }

    async function deleteProduct(kioskId, productId) {
        error.value = null
        try {
            await apiClient.delete(`/products/kiosk/${kioskId}/product/${productId}`)
            await fetchProducts(kioskId)
            return true
        } catch (err) {
            error.value = err.message || 'Məhsul silinə bilmədi'
            console.error('Məhsul silinə bilmədi:', err)
            return false
        }
    }

    return {
        products,
        allProducts,
        loading,
        error,
        fetchProducts,
        fetchAllProducts,
        addProduct,
        updateProduct,
        deleteProduct
    }
})