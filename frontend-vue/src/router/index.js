import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import SellerDashboard from '../views/seller/SellerDashboard.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/seller',
    name: 'seller',
    component: SellerDashboard,
    meta: { requiresAuth: true, role: 'seller' }
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next(authStore.user?.role === 'admin' ? '/admin' : '/seller')
  } else {
    next()
  }
})

export default router
