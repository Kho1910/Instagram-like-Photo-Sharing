import axios from 'axios'

const api = axios.create({
  baseURL: 'https://project-zhqsf.vercel.app/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Request: gắn JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response: xử lý 401 tập trung
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const url = err.config?.url || ''

    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password')
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '#/login'
    }

    return Promise.reject(err)
  }
)

export default api
