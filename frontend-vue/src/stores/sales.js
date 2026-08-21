import {
    defineStore
} from 'pinia'
import {
    ref,
    computed
} from 'vue'
import apiClient from '../api/client'

export const useSalesStore = defineStore('sales', () => {
    const cart = ref([])
    const loading = ref(false)
    const history = ref([])
    const error = ref(null)

    const cartTotal = computed(() =>
        cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    )

    const cartCount = computed(() =>
        cart.value.reduce((sum, item) => sum + item.quantity, 0)
    )

    function addToCart(product) {
        const existing = cart.value.find(item => item.product_id === product.product_id)
        const currentQty = existing ? existing.quantity : 0
        const available = product.stock_quantity ?? 0

        if (currentQty + 1 > available) {
            error.value = `${product.product_name} üçün kifayət qədər stok yoxdur. Mövcud: ${available}`
            return false
        }

        error.value = null
        if (existing) {
            existing.quantity++
        } else {
            cart.value.push({
                ...product,
                quantity: 1
            })
        }
        return true
    }

    function removeFromCart(productId) {
        cart.value = cart.value.filter(item => item.product_id !== productId)
    }

    function updateQuantity(productId, quantity) {
        const item = cart.value.find(item => item.product_id === productId)
        if (!item) return

        const desiredQty = Math.max(1, quantity)
        const available = item.stock_quantity ?? 0

        if (desiredQty > available) {
            error.value = `${item.product_name} üçün kifayət qədər stok yoxdur. Mövcud: ${available}`
            item.quantity = available > 0 ? available : 1
            return
        }

        error.value = null
        item.quantity = desiredQty
    }

    function clearCart() {
        cart.value = []
    }

    async function completeSale(kioskId, paymentMethod) {
        loading.value = true
        error.value = null
        try {
            const items = cart.value.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price
            }))

            await apiClient.post('/sales', {
                kiosk_id: kioskId,
                payment_method: paymentMethod,
                items
            })

            clearCart()
            return true
        } catch (err) {
            error.value = (err && err.message) || 'Satış tamamlana bilmədi. Stok kifayət etmir.'
            console.error('Satış tamamlana bilmədi:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    async function fetchHistory(kioskId) {
        loading.value = true
        try {
            const data = await apiClient.get(`/sales/kiosk/${kioskId}`)
            history.value = data.sales
        } catch (err) {
            console.error('Satış tarixçəsi yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        cart,
        loading,
        history,
        error,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeSale,
        fetchHistory
    }
})