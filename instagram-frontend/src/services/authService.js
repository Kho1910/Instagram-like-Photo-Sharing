// frontend/src/services/authService.js
import api from '@/api'

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    // Backend trả: { message, token, user: { id, email } }
    return { token: data.token, user: data.user }
  },

  async register(username, email, password, full_name) {
    const { data } = await api.post('/auth/register', { username, email, password, full_name })
    // Backend trả: { message, user } — không có token
    // Cần login lại sau khi register để lấy token
    const loginResult = await this.login(email, password)
    return loginResult
  },

  async getMe() {
    const { data } = await api.get('/auth/me')
    return data.user
  }
}
