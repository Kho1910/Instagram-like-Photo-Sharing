// frontend/src/services/userService.js
import api from '@/api'

export const userService = {
  async getProfile(userId) {
    const { data } = await api.get(`/users/${userId}`)
    // Backend trả: { profile: { username, fullname, bio, avatar_url } }
    // KHÔNG có id — phải giữ id từ nơi khác
    return data.profile
  },

  async getUserPosts(userId, limit = 12, cursorId = null) {
    const params = { limit }
    if (cursorId) params.cursorId = cursorId
    const { data } = await api.get(`/users/${userId}/posts`, { params })
    // Backend trả: { data: { posts, hasMore, nextCursor } }
    return data.data  // { posts, hasMore, nextCursor }
  },

  async follow(userId) {
    await api.post(`/users/${userId}/follow`)
    return { following: true }
  },

  async unfollow(userId) {
    await api.delete(`/users/${userId}/follow`)
    return { following: false }
  },

  async updateProfile(profileData) {
    const { data } = await api.put('/users/profile', profileData)
    return data.profile
  }
}
