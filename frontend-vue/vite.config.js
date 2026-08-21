import {
    defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://kazzakiosk-production.up.railway.app',
                changeOrigin: true,
            }
        }
    },
    preview: {
        port: process.env.PORT || 4173,
        host: '0.0.0.0',
        strictPort: false,
        allowedHosts: ['.railway.app', '.up.railway.app']
    }
})