// Backend dùng cursor-based pagination (lastId)
import api from '@/api'

function parseFeedResponse(feed) {
  if (!feed) return { posts: [], lastId: null }
  if (Array.isArray(feed)) return { posts: feed, lastId: null }
  return {
    posts: feed.posts || [],
    lastId: feed.lastId ?? null,
  }
}

export const feedService = {
  async getFeed(lastId = null) {
    const params = lastId ? { lastId } : {}
    const { data } = await api.get('/feed', { params })
    return parseFeedResponse(data.feed)
  },
}
