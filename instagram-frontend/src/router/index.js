import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // ── Public ──────────────────────────────────
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },

  // ── Protected ───────────────────────────────
  { path: '/', redirect: '/feed' },
  {
    path: '/feed',
    name: 'feed',
    component: () => import('@/views/FeedView.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/explore', redirect: '/feed' },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/views/UploadView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: () => import('@/views/PhotoDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/NotificationView.vue'),
    meta: { requiresAuth: true }
  },

  // ── 404 ─────────────────────────────────────
  { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  // FIX CUỘN TRANG: Nếu có vị trí cũ (lúc bấm nút Back), thì giữ nguyên vị trí đó. 
  // Nếu là mở trang mới thì mới cuộn lên top: 0
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const hasToken = !!localStorage.getItem('token')
  if (to.meta.requiresAuth  && !hasToken) return next('/login')
  if (to.meta.requiresGuest &&  hasToken) return next('/feed')
  next()
})

export default router
