import {
    defineStore
} from 'pinia'
import {
    ref
} from 'vue'
import apiClient from '../api/client'

export const useShiftStore = defineStore('shift', () => {
    const isOpen = ref(false)
    const shift = ref(null)
    const summary = ref({
        salesCount: 0,
        totalAmount: 0,
        profit: 0
    })
    const loading = ref(false)
    const error = ref(null)

    // Admin only - who currently holds each kiosk
    const activeShifts = ref([])

    async function fetchSummary() {
        loading.value = true
        error.value = null
        try {
            const data = await apiClient.get('/shifts/summary')
            isOpen.value = data.isOpen
            shift.value = data.shift
            summary.value = data.summary
        } catch (err) {
            error.value = err.message || 'Növbə məlumatı yüklənə bilmədi'
            console.error('Növbə məlumatı yüklənə bilmədi:', err)
        } finally {
            loading.value = false
        }
    }

    async function takeOver() {
        error.value = null
        try {
            await apiClient.post('/shifts/take-over')
            await fetchSummary()
            return true
        } catch (err) {
            error.value = (err && err.message) || 'Növbə təhvil alına bilmədi'
            return false
        }
    }

    async function handOver() {
        error.value = null
        try {
            await apiClient.post('/shifts/hand-over')
            await fetchSummary()
            return true
        } catch (err) {
            error.value = (err && err.message) || 'Növbə təhvil verilə bilmədi'
            return false
        }
    }

    // Admin only
    async function fetchActiveShifts() {
        try {
            const data = await apiClient.get('/shifts/active')
            activeShifts.value = data.shifts || []
        } catch (err) {
            console.error('Aktiv növbələr yüklənə bilmədi:', err)
        }
    }

    return {
        isOpen,
        shift,
        summary,
        loading,
        error,
        activeShifts,
        fetchSummary,
        takeOver,
        handOver,
        fetchActiveShifts
    }
})