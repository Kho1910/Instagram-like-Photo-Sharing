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

  return { cache, selectedPost, setPost, getPost, setSelectedPost, getSelectedPost, fetchPost, updatePost, invalidate }
})
