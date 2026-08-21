import {
    createRouter,
    createWebHistory
} from 'vue-router'
import {
    useAuthStore
} from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import SellerDashboard from '../views/seller/SellerDashboard.vue'

const routes = [{
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminDashboard,
        meta: {
            requiresAuth: true,
            role: 'admin'
        }
    },
    {
        path: '/seller',
        name: 'seller',
        component: SellerDashboard,
        meta: {
            requiresAuth: true,
            role: 'seller'
        }
    },
    {
        path: '/',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const hasToken = !!authStore.token

    // If going to login page and already authenticated
    if (to.path === '/login' && hasToken && authStore.user) {
        return next(authStore.user.role === 'admin' ? '/admin' : '/seller')
    }

    // If going to protected route
    if (to.meta.requiresAuth) {
        if (!hasToken) {
            return next('/login')
        }

        // Has token but no user data yet - try to load it
        if (!authStore.user) {
            const success = await authStore.checkAuth()
            if (!success) {
                return next('/login')
            }
        }
    }

    next()
})

export default router