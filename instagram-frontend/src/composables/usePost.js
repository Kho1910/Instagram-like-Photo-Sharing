import { ref, watch, onMounted } from 'vue'
import { interactionService } from '@/services/interactionService'
import { usePostStore } from '@/stores/postStore'

function normalizePost(post) {
  if (!post) return null
  return {
    ...post,
    like_count: post.like_count ?? post._count?.likes ?? 0,
    comment_count: post.comment_count ?? post._count?.comments ?? 0,
    view_count: post.view_count ?? post._count?.views ?? 0,
  }
}

export function usePost(postId, initialPost = null) {
  const store = usePostStore()
  const post = ref(normalizePost(initialPost) ?? null)
  const comments = ref([])
  const liked = ref(initialPost?.is_liked ?? false)
  const isFollowing = ref(initialPost?.is_following ?? false)
  const loading = ref(true)

  async function fetchPost() {
    loading.value = true
    const id = postId?.value ?? postId
    if (!id) {
      loading.value = false
      return
    }

    // Always prefer the centralized store cache when available so UI stays in sync
    const cached = store.getPost(id)
    if (cached) {
      post.value = normalizePost(cached)
      liked.value = cached.is_liked ?? false
      isFollowing.value = cached.is_following ?? false
    } else if (!post.value || String(post.value.id) !== String(id)) {
      post.value = null
      liked.value = false
      isFollowing.value = false
    }
    loading.value = false
  }

  async function fetchComments() {
    const id = postId?.value ?? postId
    if (!id) return
    comments.value = await interactionService.getComments(id)
    if (post.value) {
      post.value.comment_count = comments.value.length
      if (post.value.id) store.setPost({ ...post.value })
    }
  }

  async function toggleLike() {
    const id = postId?.value ?? postId
    if (!id || !post.value) return

    const prev = liked.value
    liked.value = !prev
    post.value.like_count = (post.value.like_count || 0) + (liked.value ? 1 : -1)
    
    // BƯỚC QUAN TRỌNG 1: Cập nhật biến is_liked và lưu ngay vào Store 
    // để khi bấm X ra Feed, Feed sẽ nhận được màu đỏ
    post.value.is_liked = liked.value
    if (post.value.id) store.setPost({ ...post.value })

    try {
      const res = liked.value
        ? await interactionService.like(id)
        : await interactionService.unlike(id)
        
      if (res && typeof res.like_count === 'number') {
        post.value.like_count = res.like_count
        // Cập nhật lại store nếu Backend trả về số đếm mới
        if (post.value.id) store.setPost({ ...post.value })
      }
    } catch {
      // Nếu API lỗi, trả lại trạng thái cũ
      liked.value = prev
      post.value.like_count = (post.value.like_count || 0) + (prev ? 1 : -1)
      post.value.is_liked = prev
      if (post.value.id) store.setPost({ ...post.value })
    }
  }

  async function addComment(content) {
    const id = postId?.value ?? postId
    if (!id) return
    try {
      const c = await interactionService.postComment(id, content)
      comments.value.push(c)
      if (post.value) {
        post.value.comment_count = (post.value.comment_count || 0) + 1
        store.setPost({ ...post.value })
      }
      await fetchComments()
    } catch (e) {
      console.error('Bình luận thất bại:', e.message)
    }
  }

  onMounted(() => {
    fetchPost()
    fetchComments()
  })

  if (typeof postId === 'object' && postId !== null && 'value' in postId) {
    watch(postId, () => {
      fetchPost()
      fetchComments()
    })
  }

  return { post, comments, liked, isFollowing, loading, toggleLike, addComment }
}
