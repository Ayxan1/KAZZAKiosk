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

    return {
        kiosks,
        loading,
        fetchKiosks
    }
})