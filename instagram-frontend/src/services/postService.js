// frontend/src/services/postService.js
import api from '@/api'

export const postService = {
  /**
   * Tạo post sau khi đã upload media
   * POST /api/posts
   * Body: { mediaIds: [id], title?, content? }
   */
  async createPost(mediaIds, title = '', content = '') {
    const { data } = await api.post('/posts', { mediaIds, title, content })
    return data.post  // { id, title, content, user_id, medias: [...] }
  },

  async deletePost(id) {
    await api.delete(`/posts/${id}`)
  },

  async getComments(postId, lastId) {
    const { data } = await api.get(`/posts/${postId}/comments`, {
      params: lastId ? { lastId } : {}
    })
    return data.comments  // [...comments]
  },

  async viewPost(postId) {
    await api.post(`/posts/${postId}/view`)
  },

  async getPost(postId) {
    const { data } = await api.get(`/posts/${postId}`)
    return data.post
  },

  // Lấy ảnh của user — dùng userRoute
  async getUserPosts(userId, page = 1, limit = 12) {
    const { data } = await api.get(`/users/${userId}/posts`, {
      params: { page, limit }
    })
    return data.data || data.posts || []
  }
}
