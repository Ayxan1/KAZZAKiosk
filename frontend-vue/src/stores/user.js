import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

export const useUserStore = defineStore('user', () => {
    const users = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchUsers() {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get('/users')
            users.value = data.users
        } catch (err) {
            error.value = err.message || 'İstifadəçilər yüklənə bilmədi'
            console.error('İstifadəçilər yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    async function createUser(user) {
        error.value = null
        try {
            await apiClient.post('/users', user)
            await fetchUsers()
            return true
        } catch (err) {
            error.value = err.message || 'İstifadəçi yaradıla bilmədi'
            console.error('İstifadəçi yaradıla bilmədi:', err)
            return false
        }
    }

    async function updateUser(userId, updates) {
        error.value = null
        try {
            await apiClient.put(`/users/${userId}`, updates)
            await fetchUsers()
            return true
        } catch (err) {
            error.value = err.message || 'İstifadəçi yenilənə bilmədi'
            console.error('İstifadəçi yenilənə bilmədi:', err)
            return false
        }
    }

    return {
        users,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser
    }
})