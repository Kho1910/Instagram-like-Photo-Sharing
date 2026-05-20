// Gọi API explore (bài từ người chưa follow) — dùng trong Feed sau khi hết bài đã follow
import api from '@/api'

function parseExploreResponse(explore) {
  if (!explore) return { posts: [], lastId: null }
  if (Array.isArray(explore)) return { posts: explore, lastId: null }
  return {
    posts: explore.posts || [],
    lastId: explore.lastId ?? null,
  }
}

export const exploreService = {
  async getExplore(lastId = null) {
    const params = lastId ? { lastId } : {}
    const { data } = await api.get('/explore', { params })
    return parseExploreResponse(data.explore)
  },
}
