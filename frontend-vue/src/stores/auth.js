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
    const checkingAuth = ref(false) // Prevent multiple simultaneous checks

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isSeller = computed(() => user.value?.role === 'seller')

    async function login(username, password) {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.post('/auth/login', {
                username,
                password
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
        // Prevent multiple simultaneous checks
        if (checkingAuth.value) {
            return !!user.value
        }

        if (!token.value) {
            user.value = null
            return false
        }

        checkingAuth.value = true
        try {
            const data = await apiClient.get('/auth/profile')
            user.value = data.user
            return true
        } catch (err) {
            // Invalid token - clear everything
            user.value = null
            token.value = null
            localStorage.removeItem('token')
            return false
        } finally {
            checkingAuth.value = false
        }
    }

    async function logout() {
        try {
            if (token.value) {
                await apiClient.post('/auth/logout')
            }
        } catch (err) {
            // Ignore - logout must proceed locally even if the request fails
        }

        user.value = null
        token.value = null
        localStorage.removeItem('token')

        // Prevent infinite redirect loop
        if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
        }
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