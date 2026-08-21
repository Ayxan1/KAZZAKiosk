import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

export const useProductStore = defineStore('product', () => {
    const products = ref([])
    const loading = ref(false)

    async function fetchProducts(kioskId, search = '') {
        loading.value = true
        try {
            const data = await apiClient.get(`/products/${kioskId}`, {
                params: {
                    search
                }
            })
            products.value = data.products
        } catch (err) {
            console.error('Məhsullar yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    async function addProduct(kioskId, product) {
        try {
            await apiClient.post(`/products/${kioskId}`, product)
            await fetchProducts(kioskId)
            return true
        } catch (err) {
            console.error('Məhsul əlavə edilə bilmədi:', err)
            return false
        }
    }

    async function updateProduct(kioskId, productId, updates) {
        try {
            await apiClient.put(`/products/${kioskId}/${productId}`, updates)
            await fetchProducts(kioskId)
            return true
        } catch (err) {
            console.error('Məhsul yenilənə bilmədi:', err)
            return false
        }
    }

    return {
        products,
        loading,
        fetchProducts,
        addProduct,
        updateProduct
    }
})