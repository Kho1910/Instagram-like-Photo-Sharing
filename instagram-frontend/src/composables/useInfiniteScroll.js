import { ref, onMounted, onUnmounted } from 'vue'

/**
 * @param {(page: number) => Promise<any[]>} fetchFn
 * @param {number} limit
 */
export function useInfiniteScroll(fetchFn, limit = 10) {
  const items    = ref([])
  const loading  = ref(false)
  const hasMore  = ref(true)
  const page     = ref(1)
  const sentinel = ref(null)
  let observer   = null

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const newItems = await fetchFn(page.value)
      items.value.push(...newItems)
      hasMore.value = newItems.length >= limit
      page.value++
    } finally { loading.value = false }
  }

  function reset() {
    items.value = []; page.value = 1; hasMore.value = true
  }

  onMounted(() => {
    loadMore()
    observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    setTimeout(() => { if (sentinel.value) observer.observe(sentinel.value) }, 150)
  })
  onUnmounted(() => observer?.disconnect())

  return { items, loading, hasMore, sentinel, loadMore, reset }
}
