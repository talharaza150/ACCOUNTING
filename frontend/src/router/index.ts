import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/request-account',
      name: 'request-account',
      component: () => import('../views/RequestAccountView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/ClientDashboard.vue'),
      meta: { requiresAuth: true, role: 'client' }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    await authStore.checkAuth()
    
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      // Redirect to appropriate dashboard based on role
      if (authStore.isAdmin) {
        next('/admin')
      } else {
        next('/dashboard')
      }
      return
    }
  }
  
  next()
})

export default router
