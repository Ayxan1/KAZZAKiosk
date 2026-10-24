import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

export const useReportStore = defineStore('report', () => {
    const overview = ref(null)
    const stats = ref(null)
    const productHistory = ref([])
    const salesReport = ref([])
    const saleDetails = ref([])
    const sellerStats = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchOverview() {
        try {
            const data = await apiClient.get('/reports/dashboard')
            overview.value = data.stats
        } catch (err) {
            console.error('Ümumi statistika yüklənə bilmədi:', err)
        }
    }

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

    async function fetchSaleDetails(params = {}) {
        error.value = null
        try {
            const data = await apiClient.get('/reports/sales-details', {
                params
            })
            saleDetails.value = data.sales || []
            sellerStats.value = data.sellers || []
        } catch (err) {
            saleDetails.value = []
            sellerStats.value = []
            error.value = err.message || 'Satış detalları yüklənə bilmədi'
            console.error('Satış detalları yüklənə bilmədi:', err)
        }
    }

    async function fetchSalesReport(params = {}) {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get('/reports/sales', {
                params
            })
            salesReport.value = data.report
        } catch (err) {
            error.value = err.message || 'Statistika yüklənə bilmədi'
            console.error('Statistika yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        overview,
        stats,
        productHistory,
        salesReport,
        saleDetails,
        sellerStats,
        loading,
        error,
        fetchOverview,
        fetchDashboardStats,
        fetchProductHistory,
        fetchSalesReport,
        fetchSaleDetails
    }
})