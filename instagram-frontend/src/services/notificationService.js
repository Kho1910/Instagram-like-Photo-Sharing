// app.use('/api/notifications', notificationRoutes)
import api from '@/api'

export const notificationService = {
  async getAll(page = 1) {
    const { data } = await api.get('/notifications', { params: { page } })
    return data.data
  },

  async markRead(id) {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllRead() {
    await api.patch('/notifications/read-all')
  }
}
