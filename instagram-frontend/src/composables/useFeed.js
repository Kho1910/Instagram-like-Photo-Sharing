// feed bài nào mới nhất xếp trước
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { feedService } from '@/services/feedService'
import { exploreService } from '@/services/exploreService'
import { FEED_PAGE_SIZE } from '@/utils/constants'

export function useFeed() {
  const posts = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const sentinel = ref(null)

  const CACHE_KEY = 'feedCache_v1'

  let feedLastId = null
  let exploreLastId = null
  // Start with feed mode so user's own posts and followed posts appear first
  let phase = 'feed' // 'feed' | 'explore'
  let observer = null

  function loadCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (Array.isArray(data.posts) && data.posts.length > 0) {
        // ensure cached posts are unique by id (preserve order)
        const seen = new Set()
        posts.value = data.posts.filter(p => {
          if (!p || p.id == null) return false
          const id = String(p.id)
          if (seen.has(id)) return false
          seen.add(id)
          return true
        })
        feedLastId = data.feedLastId ?? null
        exploreLastId = data.exploreLastId ?? null
        phase = 'feed'
        hasMore.value = true
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  function saveCache() {
    try {
      const data = {
        posts: posts.value,
        feedLastId,
        exploreLastId,
        phase,
        hasMore: hasMore.value
      }
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (e) {
      // ignore storage quota errors
    }
  }

  function parseDate(value) {
    return value ? Date.parse(value) : 0
  }

  function sortPosts() {
    posts.value.sort((a, b) => {
      const dateA = parseDate(a?.created_at)
      const dateB = parseDate(b?.created_at)
      if (dateA !== dateB) return dateB - dateA
      return String(b?.id ?? '').localeCompare(String(a?.id ?? ''))
    })
  }

  function refreshExploreDivider() {
    const hasFeedItems = posts.value.some((p) => p._source === 'feed')
    let dividerShown = false
    posts.value.forEach((post) => {
      if (post._source === 'explore' && hasFeedItems && !dividerShown) {
        post._showExploreDivider = true
        dividerShown = true
      } else {
        post._showExploreDivider = false
      }
    })
  }

  // FIX LỖI CACHE: Tự động lưu lại SessionStorage mỗi khi có bất kỳ bài post nào bị thay đổi tim/comment
  watch(posts, () => {
    saveCache()
  }, { deep: true })

  function appendExplorePosts(newPosts) {
    // Only show the "Gợi ý cho bạn" divider when we already had feed items
    const hasFeedItems = posts.value.some((p) => p._source === 'feed')
    const isFirstExplore = hasFeedItems && !posts.value.some((p) => p._source === 'explore')
    const existingIds = new Set(posts.value.map(p => String(p.id)))
    newPosts.forEach((p, i) => {
      if (!p || p.id == null) return
      if (existingIds.has(String(p.id))) return
      existingIds.add(String(p.id))
      posts.value.push({
        ...p,
        _source: 'explore'
      })
    })

    sortPosts()
    refreshExploreDivider()
    saveCache()
  }

  async function loadExploreBatch() {
    const { posts: newPosts, lastId } = await exploreService.getExplore(exploreLastId)
    if (newPosts.length === 0) {
      hasMore.value = false
      return
    }
    appendExplorePosts(newPosts)
    exploreLastId = lastId
    hasMore.value = newPosts.length >= FEED_PAGE_SIZE
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      if (phase === 'feed') {
        const { posts: newPosts, lastId } = await feedService.getFeed(feedLastId)
        if (newPosts.length > 0) {
          const existingIds = new Set(posts.value.map(p => String(p.id)))
          const feedItems = []
          newPosts.forEach((p) => {
            if (!p || p.id == null) return
            if (existingIds.has(String(p.id))) return
            existingIds.add(String(p.id))
            feedItems.push({ ...p, _source: 'feed' })
          })

          if (feedItems.length > 0) {
            posts.value.push(...feedItems)
            sortPosts()
            refreshExploreDivider()
          }

          feedLastId = lastId
          saveCache()
          if (feedItems.length < FEED_PAGE_SIZE) phase = 'explore'
        } else {
          phase = 'explore'
        }
        // Hết bài follow → tải gợi ý ngay trong cùng lần lướt, không cần kéo thêm
        if (phase === 'explore') await loadExploreBatch()
      } else {
        await loadExploreBatch()
      }
    } catch (e) {
      console.error('Feed error:', e)
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  function updateLike(postId, likeCount) {
    const p = posts.value.find((p) => p.id === postId)
    if (p) p.like_count = likeCount
    saveCache()
  }

  onMounted(() => {
    // restore cached feed if present to avoid disappearing items on back
    loadCache()
    loadMore()
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    setTimeout(() => {
      if (sentinel.value) observer.observe(sentinel.value)
    }, 150)
  })
  onUnmounted(() => observer?.disconnect())

  return { posts, loading, hasMore, sentinel, loadMore, updateLike }
}
