// frontend/src/services/feedService.js
// Backend dùng cursor-based pagination (lastId) thay vì page
import api from '@/api'

export const feedService = {
  async getFeed(lastId = null) {
    const params = lastId ? { lastId } : {}
    const { data } = await api.get('/feed', { params })
    // Backend trả: { message, feed: [...posts] }
    return data.feed || []
  }
}
