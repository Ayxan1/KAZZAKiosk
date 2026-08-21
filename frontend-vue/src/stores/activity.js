import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

export const useActivityStore = defineStore('activity', () => {
    const logs = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchLogs(params = {}) {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get('/activity-logs', {
                params
            })
            logs.value = data.logs || []
        } catch (err) {
            error.value = err.message || 'Fəaliyyət jurnalı yüklənə bilmədi'
            console.error('Fəaliyyət jurnalı yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        logs,
        loading,
        error,
        fetchLogs
    }
})