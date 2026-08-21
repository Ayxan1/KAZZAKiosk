import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

export const useReportStore = defineStore('report', () => {
    const stats = ref(null)
    const productHistory = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchDashboardStats(params = {}) {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get('/reports/dashboard', {
                params
            })
            stats.value = data.stats
        } catch (err) {
            error.value = err.message || 'Statistika yüklənə bilmədi'
            console.error('Statistika yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    async function fetchProductHistory(params = {}) {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get('/products/history', {
                params
            })
            productHistory.value = data.history
        } catch (err) {
            error.value = err.message || 'Tarixçə yüklənə bilmədi'
            console.error('Tarixçə yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        stats,
        productHistory,
        loading,
        error,
        fetchDashboardStats,
        fetchProductHistory
    }
})
