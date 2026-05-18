// app.use('/api/explore', exploreRoutes)
import api from '@/api'

export const exploreService = {
  async getExplore(page = 1, limit = 12) {
    const { data } = await api.get('/explore', { params: { page, limit } })
    return data   // { data: [...], meta }
  },

  async search(q, page = 1) {
    const { data } = await api.get('/explore/search', { params: { q, page } })
    return data
  }
}
