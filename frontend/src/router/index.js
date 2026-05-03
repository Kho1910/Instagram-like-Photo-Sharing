import { createRouter, createWebHistory } from 'vue-router'

// Sử dụng Lazy Loading để tối ưu hiệu năng (chỉ load trang khi cần)
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true } // Yêu cầu đăng nhập
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true } // Chỉ dành cho người chưa đăng nhập
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/feed',
    name: 'Feed',
    component: () => import('../views/FeedView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('../views/UploadView.vue'),
    meta: { requiresAuth: true }
  },
  // Trang 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// --- NAVIGATION GUARD: Bản sửa lỗi White Screen ---
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // 1. Nếu cố vào Register mà đang có token cũ -> Xóa sạch để không bị kẹt
  if (to.path === '/register' && isAuthenticated) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Sau khi xóa xong thì cho phép vào Register như khách mới
    return next() 
  }

  // 2. Yêu cầu đăng nhập mà chưa có token
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login' })
  } 

  // 3. Đã đăng nhập mà vào trang dành cho khách (Login/Register)
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'Feed' })
  } 

  // 4. Luôn luôn phải có next() ở cuối để tránh treo máy
  next()
})

export default router