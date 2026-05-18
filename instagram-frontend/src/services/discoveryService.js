// app.use('/api/users', userRoutes) → /users/suggested
import api from '@/api'

export const discoveryService = {
  async getSuggested(limit = 5) {
    const { data } = await api.get('/users/suggested', { params: { limit } })
    return data.data
  }
}
