// src/services/authService.js
import api from '@/api/axios'

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data  // { token, user }
  },

  async register(username, email, password) {
    const { data } = await api.post('/auth/register', {
      username, email, password
    })
    return data  // { token, user }
  }
}

export default authService