import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePostStore = defineStore('post', () => {
  const cache = ref({})  // { [postId]: postData }
  const selectedPost = ref(null)

  function _normalizeId(id) {
    return id == null ? id : String(id)
  }

  function setPost(post) {
    if (!post || post.id == null) return
    cache.value[_normalizeId(post.id)] = post
  }

  function getPost(id) {
    return cache.value[_normalizeId(id)] || null
  }

  function setSelectedPost(post) {
    if (!post || post.id == null) return
    selectedPost.value = post
    setPost(post)
  }

  function getSelectedPost() {
    return selectedPost.value
  }

  async function fetchPost(id) {
    return getPost(id)
  }

  function updatePost(id, patch) {
    if (cache.value[id] && patch) Object.assign(cache.value[id], patch)
  }

  function invalidate(id) {
    delete cache.value[id]
    if (selectedPost.value && String(selectedPost.value.id) === String(id)) {
      selectedPost.value = null
    }
  }

  function patchUserAvatar(userId, avatarUrl) {
    const uid = String(userId)
    for (const post of Object.values(cache.value)) {
      if (!post) continue
      const postUserId = String(post.user_id ?? post.user?.id ?? '')
      if (postUserId !== uid) continue
      post.avatar_url = avatarUrl
      if (post.user) post.user.avatar_url = avatarUrl
    }
    if (selectedPost.value) {
      const selUid = String(selectedPost.value.user_id ?? selectedPost.value.user?.id ?? '')
      if (selUid === uid) {
        selectedPost.value.avatar_url = avatarUrl
        if (selectedPost.value.user) selectedPost.value.user.avatar_url = avatarUrl
      }
    }
  }

  return { cache, selectedPost, setPost, getPost, setSelectedPost, getSelectedPost, fetchPost, updatePost, invalidate, patchUserAvatar }
})
