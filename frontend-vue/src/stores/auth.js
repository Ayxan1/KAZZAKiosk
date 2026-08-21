import {
    defineStore
} from 'pinia'
import {
    ref,
    computed
} from 'vue'
import apiClient from '../api/client'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token'))
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => !!user.value && !!token.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isSeller = computed(() => user.value?.role === 'seller')

    async function login(username, password, kioskId = null) {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.post('/auth/login', {
                username,
                password,
                kiosk_id: kioskId
            })

            token.value = data.token
            user.value = data.user
            localStorage.setItem('token', data.token)

            router.push(data.user.role === 'admin' ? '/admin' : '/seller')
            return true
        } catch (err) {
            error.value = err.message || 'Login xətası'
            return false
        } finally {
            loading.value = false
        }
    }

    async function checkAuth() {
        if (!token.value) return

        try {
            const data = await apiClient.get('/auth/profile')
            user.value = data.user
        } catch (err) {
            logout()
        }
    }

    function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        router.push('/login')
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isSeller,
        login,
        checkAuth,
        logout
    }
})