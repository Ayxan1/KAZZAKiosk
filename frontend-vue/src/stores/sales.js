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

    const cartTotal = computed(() =>
        cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    )

    const cartCount = computed(() =>
        cart.value.reduce((sum, item) => sum + item.quantity, 0)
    )

    function addToCart(product) {
        const existing = cart.value.find(item => item.product_id === product.product_id)
        if (existing) {
            existing.quantity++
        } else {
            cart.value.push({
                ...product,
                quantity: 1
            })
        }
    }

    function removeFromCart(productId) {
        cart.value = cart.value.filter(item => item.product_id !== productId)
    }

    function updateQuantity(productId, quantity) {
        const item = cart.value.find(item => item.product_id === productId)
        if (item) {
            item.quantity = Math.max(1, quantity)
        }
    }

    function clearCart() {
        cart.value = []
    }

    async function completeSale(kioskId, paymentMethod) {
        loading.value = true
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
            console.error('Satış tamamlana bilmədi:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        cart,
        loading,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeSale
    }
})