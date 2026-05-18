// frontend/src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  // Backend login trả { id, email } — username lấy từ register hoặc getMe
  const userId   = computed(() => user.value?.id   ?? null)
  const username = computed(() => user.value?.username ?? user.value?.email ?? '')

  async function login(email, password) {
    const res = await authService.login(email, password)
    // res = { token, user: { id, email } }
    // Fetch thêm profile để lấy username
    _setAuth(res.token, res.user)
    try {
      // Lấy profile đầy đủ ngay sau login
      const { userService } = await import('@/services/userService')
      const profile = await userService.getProfile(res.user.id)
      _setAuth(res.token, { ...res.user, ...profile })
    } catch(e) {
      console.warn('Không lấy được profile sau login:', e.message)
    }
    return res
  }

  async function register(uname, email, password, full_name) {
    const res = await authService.register(uname, email, password, full_name)
    _setAuth(res.token, res.user)
    try {
      const { userService } = await import('@/services/userService')
      const profile = await userService.getProfile(res.user.id)
      _setAuth(res.token, { ...res.user, ...profile })
    } catch(e) {
      console.warn('Không lấy được profile sau register:', e.message)
    }
    return res
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function _setAuth(t, u) {
    token.value = t
    user.value  = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  return { token, user, isLoggedIn, userId, username, login, register, logout }
})
