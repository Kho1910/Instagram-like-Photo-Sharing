// frontend/src/composables/useFeed.js
// Dùng cursor-based (lastId) thay vì page-based
import { ref, onMounted, onUnmounted } from 'vue'
import { feedService } from '@/services/feedService'

export function useFeed() {
  const posts   = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const sentinel = ref(null)
  let lastId    = null
  let observer  = null

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const newPosts = await feedService.getFeed(lastId)
      if (!newPosts || newPosts.length === 0) {
        hasMore.value = false
      } else {
        posts.value.push(...newPosts)
        // lastId là id của post cuối cùng — dùng cho lần load tiếp
        lastId = newPosts[newPosts.length - 1]?.id || null
        hasMore.value = newPosts.length >= 10
      }
    } catch(e) {
      console.error('Feed error:', e)
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  function updateLike(postId, likeCount) {
    const p = posts.value.find(p => p.id === postId)
    if (p) p.like_count = likeCount
  }

  onMounted(() => {
    loadMore()
    observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    setTimeout(() => {
      if (sentinel.value) observer.observe(sentinel.value)
    }, 150)
  })
  onUnmounted(() => observer?.disconnect())

  return { posts, loading, hasMore, sentinel, loadMore, updateLike }
}
