import api from '@/api/axios'

export const getFeed = async () => {
  const { data } = await api.get('/posts')
  return data.posts || []
}

export const getUserProfile = async (userId) => {
  const { data } = await api.get(`/users/${userId}`)
  return data.profile
}
