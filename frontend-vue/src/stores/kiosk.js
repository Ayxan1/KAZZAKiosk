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

    // Public, no authentication required. Used on the login page
    // so a seller can pick their kiosk before signing in.
    async function fetchPublicKiosks() {
        loading.value = true
        try {
            const data = await apiClient.get('/kiosks/public')
            kiosks.value = data.kiosks
        } catch (err) {
            console.error('Kiosk yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        kiosks,
        loading,
        fetchKiosks,
        fetchPublicKiosks
    }
})