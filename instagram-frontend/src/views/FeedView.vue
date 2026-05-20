<!-- frontend/src/views/FeedView.vue -->
<template>
  <div class="feed-layout page-wrap">
    <div class="feed-main">
      <h1 class="page-heading">Feed</h1>

      <div v-if="loading && posts.length === 0" class="loader-center">
        <div class="spinner"></div>
        <p>Đang tải bảng tin...</p>
      </div>

      <div v-else-if="!loading && posts.length === 0" class="empty-state">
        <p>📭 Chưa có bài đăng nào.</p>
        <p>Hãy follow thêm người dùng — khi có bài mới, chúng sẽ hiện ở đây.</p>
      </div>

      <template v-for="post in posts" :key="post.id">
        <div v-if="post._showExploreDivider" class="section-divider">
          <span>Gợi ý cho bạn</span>
        </div>
        <div class="post-card card">
        <!-- Header -->
        <div class="post-header">
          <router-link :to="'/users/' + (post.user?.id || post.user_id)"
            class="post-author">
            <UserAvatar
              :username="post.user?.username || post.username"
              :src="post.user?.avatar_url || post.avatar_url"
              :size="36"
            />
            <div>
              <p class="author-name">{{ post.user?.username || post.username }}</p>
              <p class="post-time">{{ formatDate(post.created_at) }}</p>
            </div>
          </router-link>
        </div>

        <!-- Ảnh: medias là array từ Prisma include -->
        <div v-if="post.medias && post.medias.length > 0" class="post-media-container">
          <img
            :src="buildUrl(post.medias[0].public_id)"
            class="post-img"
            loading="lazy"
            @click.stop="openPost(post)"
          />
          <div v-if="post.medias.length > 1" class="media-counter">
            1/{{ post.medias.length }}
          </div>
        </div>

        <!-- Body -->
        <div class="post-body">
          <div class="post-actions">
            <LikeButton
              :model-value="post.is_liked"
              :count="post.like_count ?? post._count?.likes ?? 0"
              @toggle="() => toggleLike(post)"
            />
            <button class="comment-btn" type="button" @click="openComment(post)">
              💬 {{ post.comment_count ?? post._count?.comments ?? 0 }}
            </button>
          </div>
          <p v-if="post.title"   class="post-title">{{ post.title }}</p>
          <p v-if="post.content" class="post-content">{{ post.content }}</p>
        </div>
        </div>
      </template>

      <!-- Sentinel -->
      <div ref="sentinel" class="sentinel">
        <div v-if="loading && posts.length > 0" class="spinner"></div>
        <p v-else-if="!hasMore && posts.length > 0" class="end-msg">Đã xem hết ✓</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatters'
import { useFeed }    from '@/composables/useFeed'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'
import { ref, watch, onMounted } from 'vue'
import LikeButton from '@/components/common/LikeButton.vue'
import UserAvatar from '@/components/user/UserAvatar.vue'
import { interactionService } from '@/services/interactionService'
import { useAuthStore } from '@/stores/authStore'
import { patchPostsAvatarInList } from '@/utils/feedCache'

const router = useRouter()
const postStore = usePostStore()
const authStore = useAuthStore()
const { posts, loading, hasMore, sentinel } = useFeed()

// Restore scroll position when returning from PhotoDetail and keep in-sync
const restored = ref(false)

watch(posts, (list) => {
  if (!restored.value && list.length > 0) {
    const y = Number(sessionStorage.getItem('feedScrollY') || 0)
    if (y) window.scrollTo(0, y)
    restored.value = true
    sessionStorage.removeItem('feedScrollY')
  }
}, { immediate: true })

// Hàm này có nhiệm vụ: Quét toàn bộ bài viết đang hiển thị trên Feed, 
// nếu trong Kho (Store) có dữ liệu mới hơn thì lập tức đè dữ liệu mới vào.
function syncFeedWithStore() {
  const cache = postStore.cache
  if (!cache) return

  posts.value.forEach(p => {
    const updated = cache[String(p.id)]
    if (updated) {
      // Cập nhật lượt đếm
      p.like_count = updated.like_count ?? p.like_count
      p.comment_count = updated.comment_count ?? p.comment_count
      
      if (p._count) {
        p._count.likes = updated.like_count ?? p._count.likes
        p._count.comments = updated.comment_count ?? p._count.comments
      }
      
      // Cập nhật trạng thái Tim
      if (updated.is_liked !== undefined) {
        p.is_liked = updated.is_liked
      }

      const avatarUrl = updated.avatar_url ?? updated.user?.avatar_url
      if (avatarUrl) {
        p.avatar_url = avatarUrl
        if (p.user) p.user.avatar_url = avatarUrl
      }
    }
  })
}

function syncMyAvatarOnFeed() {
  const uid = authStore.userId
  const url = authStore.user?.avatar_url
  if (!uid || !url) return
  patchPostsAvatarInList(posts.value, uid, url)
}

watch(() => authStore.user?.avatar_url, () => {
  syncMyAvatarOnFeed()
})

onMounted(() => {
  syncMyAvatarOnFeed()
})

// 1. Theo dõi khi Store có thay đổi (khi bạn đang ở Feed mà bấm Like)
watch(() => postStore.cache, syncFeedWithStore, { deep: true })

// 2. ĐIỂM QUYẾT ĐỊNH: Chạy hàm đồng bộ ngay khi Feed vừa lấy xong dữ liệu từ bộ nhớ tạm!
// Nhờ dòng này, khi bạn từ Detail về Feed, nó sẽ lấy trạng thái tắt/bật tim mới nhất đè lên ngay lập tức.
watch(() => posts.value.length, () => {
  syncFeedWithStore()
})

function setSelectedPost(post) {
  const plainPost = JSON.parse(JSON.stringify(post))
  postStore.setSelectedPost(plainPost)
  sessionStorage.setItem('selectedPost', JSON.stringify(plainPost))
  return plainPost
}

function openPost(post) {
  // save scroll position so we can restore after returning
  sessionStorage.setItem('feedScrollY', String(window.scrollY || window.pageYOffset || 0))
  const plainPost = setSelectedPost(post)
  router.push({
    name: 'post-detail',
    params: { id: plainPost.id },
    state: { post: plainPost }
  })
}

function openComment(post) {
  sessionStorage.setItem('feedScrollY', String(window.scrollY || window.pageYOffset || 0))
  const plainPost = setSelectedPost(post)
  router.push({
    name: 'post-detail',
    params: { id: plainPost.id },
    state: { post: plainPost, focusComment: true }
  })
}

async function toggleLike(post) {
  if (!post?.id) return

  const wasLiked = !!post.is_liked
  const previousCount = Number(post.like_count ?? post._count?.likes ?? 0)
  const nextCount = previousCount + (wasLiked ? -1 : 1)

  post.is_liked = !wasLiked
  post.like_count = nextCount
  if (post.id) postStore.setPost({ ...post })

  try {
    const res = wasLiked
      ? await interactionService.unlike(post.id)
      : await interactionService.like(post.id)

    if (res && typeof res.like_count === 'number') {
      post.like_count = res.like_count
    }
    post.is_liked = !wasLiked
    if (post.id) postStore.setPost({ ...post })
  } catch (error) {
    post.is_liked = wasLiked
    post.like_count = previousCount
    if (post.id) postStore.setPost({ ...post })
  }
}

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
function buildUrl(publicId) {
  if (!CLOUD || !publicId) return ''
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${publicId}`
}
</script>

<style scoped>
.feed-layout {
  display: flex;
  justify-content: center;
  padding: 0 0 24px;
}
.feed-main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding-top: 20px;
}
.page-heading {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 22px;
}

.post-card   { margin-bottom:20px; border-radius:var(--radius-lg); background:var(--color-surface); border:1px solid var(--color-border); overflow:hidden; }
.post-header { padding:12px 14px; border-bottom:1px solid var(--color-border); }
.post-author { display:flex; align-items:center; gap:10px;
  text-decoration:none; color:inherit; }
.author-name { font-weight:600; font-size:14px; }
.post-time   { font-size:11px; color:var(--color-text-muted); }
.post-img    { width:100%; display:block; cursor:pointer; max-height:600px; object-fit:contain; background:var(--color-surface-hover); }

.post-media-container {
  position: relative;
  width: 100%;
  background: var(--color-surface-hover);
}

.media-counter {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
}

.post-body   { padding:12px 14px; }
.post-actions { display:flex; gap:14px; margin-bottom:8px; align-items:center; }
.comment-btn { border:none; background:none; color:var(--color-text-muted); font-size:14px; cursor:pointer; padding:0; display:flex; align-items:center; gap:6px; transition:color 0.2s ease; }
.comment-btn:hover { color:var(--color-primary); }
.post-title  { font-weight:600; font-size:14px; margin-bottom:4px; }
.post-content { font-size:13px; color:var(--color-text-muted); }

.loader-center { display:flex; flex-direction:column; align-items:center;
  padding:48px; gap:12px; color:var(--color-text-muted); }
.spinner { width:28px; height:28px; border-radius:50%;
  border:3px solid var(--color-border); border-top-color:var(--color-primary);
  animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.section-divider {
  display:flex; align-items:center; gap:12px;
  margin:24px 0 16px; color:var(--color-text-muted); font-size:12px;
  font-weight:600; text-transform:uppercase; letter-spacing:.05em;
}
.section-divider::before,
.section-divider::after {
  content:''; flex:1; height:1px; background:var(--color-border);
}
.sentinel  { padding:20px; text-align:center; }
.end-msg   { font-size:13px; color:var(--color-text-muted); }
</style>
