// app.use('/api', interactionRoute)
// → route file sẽ define: /posts/:id/like, /posts/:id/comments
import api from '@/api'

function normalizeComment(comment) {
  if (!comment) return null
  const user = comment.user || {}
  return {
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    user_id: user.id,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.avatar_url
  }
}

export const interactionService = {
  async like(postId) {
    const { data } = await api.post(`/posts/${postId}/like`)
    return data.data ?? {}
  },

  async unlike(postId) {
    const { data } = await api.post(`/posts/${postId}/unlike`)
    return data.data ?? {}
  },

  async getComments(postId) {
    const { data } = await api.get(`/posts/${postId}/comments`)
    const comments = data.comments ?? []
    return comments.map(normalizeComment)
  },

  async postComment(postId, content) {
    const { data } = await api.post(`/posts/${postId}/comments`, { content })
    return normalizeComment(data.comment)
  },

  async deleteComment(postId, commentId) {
    await api.delete(`/posts/${postId}/comments/${commentId}`)
  }
}
