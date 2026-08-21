import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

export const useKioskStore = defineStore('kiosk', () => {
    const kiosks = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Admin-only, requires authentication. Used inside the dashboard.
    async function fetchKiosks() {
        loading.value = true
        try {
            const data = await apiClient.get('/kiosks')
            kiosks.value = data.kiosks
        } catch (err) {
            console.error('Kiosk yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    async function createKiosk(kioskName) {
        error.value = null
        try {
            await apiClient.post('/kiosks', {
                kiosk_name: kioskName
            })
            await fetchKiosks()
            return true
        } catch (err) {
            error.value = err.message || 'Kiosk yaradıla bilmədi'
            console.error('Kiosk yaradıla bilmədi:', err)
            return false
        }
    }

    async function updateKiosk(kioskId, updates) {
        error.value = null
        try {
            await apiClient.put(`/kiosks/${kioskId}`, updates)
            await fetchKiosks()
            return true
        } catch (err) {
            error.value = err.message || 'Kiosk yenilənə bilmədi'
            console.error('Kiosk yenilənə bilmədi:', err)
            return false
        }
    }

    return {
        kiosks,
        loading,
        error,
        fetchKiosks,
        createKiosk,
        updateKiosk
    }
})