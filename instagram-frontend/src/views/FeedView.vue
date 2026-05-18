<!-- frontend/src/views/FeedView.vue -->
<template>
  <div class="feed-layout page-wrap">
    <div class="feed-main">

      <div v-if="loading && posts.length === 0" class="loader-center">
        <div class="spinner"></div>
        <p>Đang tải bảng tin...</p>
      </div>

      <div v-else-if="!loading && posts.length === 0" class="empty-state">
        <p>📭 Chưa có bài đăng nào.</p>
        <p>Hãy <router-link to="/explore">khám phá</router-link>
           và follow mọi người!</p>
      </div>

      <div v-for="post in posts" :key="post.id" class="post-card card">
        <!-- Header -->
        <div class="post-header">
          <router-link :to="'/users/' + (post.user?.id || post.user_id)"
            class="post-author">
            <div class="avatar">
              {{ (post.user?.username || post.username)?.[0]?.toUpperCase() }}
            </div>
            <div>
              <p class="author-name">{{ post.user?.username || post.username }}</p>
              <p class="post-time">{{ formatDate(post.created_at) }}</p>
            </div>
          </router-link>
        </div>

        <!-- Ảnh: medias là array từ Prisma include -->
        <div v-if="post.medias && post.medias.length > 0">
          <img
            v-for="media in post.medias"
            :key="media.id"
            :src="buildUrl(media.public_id)"
            class="post-img"
            loading="lazy"
            @click.stop="openPost(post)"
          />
        </div>

        <!-- Body -->
        <div class="post-body">
          <div class="post-actions">
            <span class="action">♥ {{ post._count?.likes || 0 }}</span>
            <span class="action">💬 {{ post._count?.comments || 0 }}</span>
            <span class="action">👁 {{ post._count?.views || 0 }}</span>
          </div>
          <p v-if="post.title"   class="post-title">{{ post.title }}</p>
          <p v-if="post.content" class="post-content">{{ post.content }}</p>
        </div>
      </div>

      <!-- Sentinel -->
      <div ref="sentinel" class="sentinel">
        <div v-if="loading && posts.length > 0" class="spinner"></div>
        <p v-else-if="!hasMore && posts.length > 0" class="end-msg">Đã xem hết ✓</p>
      </div>
    </div>

    <aside class="feed-sidebar">
      <p class="sidebar-title">Gợi ý cho bạn</p>
    </aside>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatters'
import { useFeed }    from '@/composables/useFeed'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'

const router = useRouter()
const postStore = usePostStore()
const { posts, loading, hasMore, sentinel } = useFeed()

function openPost(post) {
  const plainPost = JSON.parse(JSON.stringify(post))
  postStore.setSelectedPost(plainPost)
  sessionStorage.setItem('selectedPost', JSON.stringify(plainPost))
  router.push({
    name: 'post-detail',
    params: { id: plainPost.id },
    state: { post: plainPost }
  })
}

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
function buildUrl(publicId) {
  if (!CLOUD || !publicId) return ''
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${publicId}`
}
</script>

<style scoped>
.feed-layout { display:flex; gap:32px; }
.feed-main   { flex:1; max-width:600px; margin:0 auto; }
.feed-sidebar { width:200px; flex-shrink:0; display:none; }
@media (min-width:900px) { .feed-sidebar { display:block; } }
.sidebar-title { font-size:12px; font-weight:600; color:#718096;
  text-transform:uppercase; letter-spacing:.05em; }

.post-card   { margin-bottom:20px; }
.post-header { padding:12px 14px; }
.post-author { display:flex; align-items:center; gap:10px;
  text-decoration:none; color:inherit; }
.avatar { width:36px; height:36px; border-radius:50%;
  background:var(--color-primary); color:#fff;
  display:flex; align-items:center; justify-content:center;
  font-weight:700; font-size:14px; flex-shrink:0; }
.author-name { font-weight:600; font-size:14px; }
.post-time   { font-size:11px; color:#718096; }
.post-img    { width:100%; display:block; cursor:pointer; }
.post-body   { padding:10px 14px; }
.post-actions { display:flex; gap:14px; margin-bottom:8px; }
.action      { font-size:14px; color:#718096; }
.post-title  { font-weight:600; font-size:14px; margin-bottom:4px; }
.post-content { font-size:13px; color:#718096; }

.loader-center { display:flex; flex-direction:column; align-items:center;
  padding:48px; gap:12px; color:#718096; }
.spinner { width:28px; height:28px; border-radius:50%;
  border:3px solid #e2e8f0; border-top-color:var(--color-primary);
  animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.sentinel  { padding:20px; text-align:center; }
.end-msg   { font-size:13px; color:#718096; }
</style>
