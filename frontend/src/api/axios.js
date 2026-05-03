import axios from 'axios'
import router from '@/router'

// Lấy base URL từ biến môi trường
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    
    // CHỈ gắn token nếu request gửi tới Server của mình (tránh gửi sang Cloudinary)
    const isInternalRequest = config.url.startsWith('/') || config.url.startsWith(BASE_URL)
    
    if (token && isInternalRequest) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status

    if (status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Chỉ chuyển hướng nếu không phải đang ở trang login
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    } else if (status === 403) {
       console.error("Bạn không có quyền thực hiện hành động này.")
    } else if (status >= 500) {
       console.error("Lỗi hệ thống, vui lòng thử lại sau.")
    }
    
    return Promise.reject(error)
  }
)

export default api