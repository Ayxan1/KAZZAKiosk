import axios from 'axios'

const API_BASE_URL = 'https://kazzakiosk-production.up.railway.app/api'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    response => response.data,
    error => {
        // Let the calling code handle 401 errors
        // Don't redirect here to avoid infinite loops
        return Promise.reject(error.response?.data || error.message)
    }
)

export default apiClient