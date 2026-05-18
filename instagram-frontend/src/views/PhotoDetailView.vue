<template>
  <div class="page-wrap">
    <BaseSpinner v-if="loading && !post" label="Đang tải..." />

    <div v-else-if="post" class="detail-layout card">
      <!-- Ảnh -->
      <div class="detail-img-col">
        <div class="img-container">
          <img :src="getAllImageUrls(post)[currentImageIndex] || getImageUrl(post)" class="detail-img" />
          <div v-if="getAllImageUrls(post).length > 1" class="img-nav">
            <button @click="currentImageIndex = Math.max(0, currentImageIndex - 1)" :disabled="currentImageIndex === 0" class="nav-btn">❮</button>
            <span class="img-counter">{{ currentImageIndex + 1 }} / {{ getAllImageUrls(post).length }}</span>
            <button @click="currentImageIndex = Math.min(getAllImageUrls(post).length - 1, currentImageIndex + 1)" :disabled="currentImageIndex === getAllImageUrls(post).length - 1" class="nav-btn">❯</button>
          </div>
        </div>
      </div>

      <!-- Info panel -->
      <div class="detail-info-col">
        <!-- Author -->
        <div class="detail-author">
          <router-link :to="'/users/' + post.user_id" class="author-link">
            <UserAvatar :username="post.username" :src="post.avatar_url" :size="40" />
            <strong>{{ post.username }}</strong>
          </router-link>
          <FollowButton v-if="!isOwner"
            :user-id="post.user_id" :is-following="isFollowing"
            @update:is-following="v => isFollowing = v" />
        </div>

        <!-- Resolution badge (quan trọng cho demo) -->
        <div class="detail-badge">
          <ResolutionBadge :tier="post.resolution_tier" :status="post.status" />
        </div>

        <!-- Title and caption -->
        <p v-if="post.title" class="detail-title">{{ post.title }}</p>
        <p v-if="post.content" class="detail-content">{{ post.content }}</p>
        <p v-else-if="post.caption" class="detail-caption">{{ post.caption }}</p>

        <!-- Actions -->
        <PhotoActions :post="post"
          @like-updated="n => post.like_count = n"
          @focus-comment="focusInput" />

        <!-- Comments -->
        <CommentInput ref="commentInput" @submit="onSubmitComment" />
        <CommentList :comments="comments" />
      </div>
    </div>
    <div v-else class="empty-state card">
      <p>Không tìm thấy nội dung bài đăng.</p>
      <router-link to="/feed">Trở về Feed</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute }    from 'vue-router'
import { usePost }     from '@/composables/usePost'
import { useAuth }     from '@/composables/useAuth'
import { usePostStore } from '@/stores/postStore'
import UserAvatar     from '@/components/user/UserAvatar.vue'
import FollowButton   from '@/components/user/FollowButton.vue'
import ResolutionBadge from '@/components/photo/ResolutionBadge.vue'
import PhotoActions   from '@/components/photo/PhotoActions.vue'
import CommentList    from '@/components/common/CommentList.vue'
import CommentInput   from '@/components/common/CommentInput.vue'
import BaseSpinner    from '@/components/base/BaseSpinner.vue'

const route  = useRoute()
const postStore = usePostStore()
const { userId, user } = useAuth()
const postId = computed(() => route.params.id)

const cachedPost = route.state?.post
  || window.history.state?.post
  || postStore.getSelectedPost()
  || postStore.getPost(postId.value)
  || (() => {
    const saved = sessionStorage.getItem('selectedPost')
    try {
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })()
if (cachedPost) {
  postStore.setSelectedPost(cachedPost)
  if (String(cachedPost.user_id) === String(userId.value)) {
    cachedPost.username = cachedPost.username || user.value?.username
    cachedPost.avatar_url = cachedPost.avatar_url || user.value?.avatar_url
  }
}

const commentInput = ref(null)
const currentImageIndex = ref(0)
const { post, comments, liked, isFollowing, loading, toggleLike, addComment } =
  usePost(postId, cachedPost)

async function onSubmitComment(content) {
  if (!post.value?.id) return
  await addComment(content)
}

function focusInput() {
  return commentInput.value?.focus()
}

function getImageUrl(postItem) {
  if (!postItem) return ''
  if (postItem.resized_url) return postItem.resized_url
  if (postItem.original_url) return postItem.original_url
  if (postItem.medias && postItem.medias[0]?.public_id) {
    const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    return CLOUD ? `https://res.cloudinary.com/${CLOUD}/image/upload/${postItem.medias[0].public_id}` : ''
  }
  if (postItem.public_id) {
    const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    return CLOUD ? `https://res.cloudinary.com/${CLOUD}/image/upload/${postItem.public_id}` : ''
  }
  return ''
}

function getAllImageUrls(postItem) {
  if (!postItem?.medias) return []
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  if (!CLOUD) return []
  return postItem.medias.map(m => `https://res.cloudinary.com/${CLOUD}/image/upload/${m.public_id}`)
}

const isOwner = computed(() => String(post.value?.user_id) === String(userId.value))
</script>

<style scoped>
.page-wrap { padding: 16px; }
.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.empty-state { text-align: center; padding: 40px 20px; }

.detail-layout {
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .detail-layout {
    flex-direction: row;
  }
}

.detail-img-col {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  position: relative;
}

.img-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-img {
  width: 100%;
  max-height: 560px;
  object-fit: contain;
}

.img-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 0 8px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.img-counter {
  color: #ccc;
  font-size: 12px;
}

.detail-info-col {
  width: 100%;
  flex-shrink: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

@media (min-width: 640px) {
  .detail-info-col {
    width: 320px;
  }
}

.detail-author {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.author-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text);
}

.detail-badge {
  margin-bottom: 10px;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.detail-content, .detail-caption {
  font-size: 14px;
  margin-bottom: 12px;
  color: #4a5568;
}

.comment-note {
  margin-top: 12px;
  font-size: 13px;
  color: #718096;
}
</style>
.detail-info-col { width: 100%; flex-shrink: 0; padding: 16px;
  display: flex; flex-direction: column; }
@media (min-width: 640px) { .detail-info-col { width: 320px; } }

.detail-author { display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 12px; }
.author-link   { display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: var(--color-text); }
.detail-badge  { margin-bottom: 10px; }
.detail-caption { font-size: 13px; margin-bottom: 12px; }
.detail-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.detail-content, .detail-caption { font-size: 14px; margin-bottom: 12px; color: #4a5568; }
.comment-note { margin-top: 12px; font-size: 13px; color: #718096; }


