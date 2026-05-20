<template>
  <div class="page-wrap post-detail-page">
    <BaseSpinner v-if="loading && !post" label="Đang tải..." />

    <div v-else-if="post" class="detail-shell">
      <div class="detail-layout card">
      <!-- Ảnh -->
      <div
        class="detail-img-col"
        :class="{ 'detail-img-col--loading': !mediaBoxSize }"
        :style="mediaColStyle"
      >
        <div
          class="media-stage"
          :class="{ 'media-stage--measuring': isMeasuringImages }"
          :style="mediaStageStyle"
        >
          <img
            :key="currentImageUrl"
            :src="currentImageUrl"
            :alt="post.title || 'Ảnh bài đăng'"
            class="detail-img"
          />

          <button
            v-if="hasMultipleImages"
            type="button"
            class="carousel-arrow carousel-arrow--prev"
            :class="{ 'carousel-arrow--disabled': !canGoPrev }"
            :disabled="!canGoPrev"
            aria-label="Ảnh trước"
            @click="prevImage"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button
            v-if="hasMultipleImages"
            type="button"
            class="carousel-arrow carousel-arrow--next"
            :class="{ 'carousel-arrow--disabled': !canGoNext }"
            :disabled="!canGoNext"
            aria-label="Ảnh sau"
            @click="nextImage"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div v-if="hasMultipleImages" class="carousel-dots" aria-hidden="true">
            <span
              v-for="(_, i) in imageUrls"
              :key="i"
              class="carousel-dot"
              :class="{ 'carousel-dot--active': i === currentImageIndex }"
            />
          </div>
        </div>
      </div>

      <!-- Info panel -->
      <div class="detail-info-col">
        <div class="detail-info-top">
          <div class="detail-author">
            <router-link :to="'/users/' + displayUserId" class="author-link">
              <UserAvatar :username="displayUsername" :src="displayAvatar" :size="40" />
              <strong>{{ displayUsername }}</strong>
            </router-link>
            <!-- Follow button disabled by request -->
            <!-- <FollowButton v-if="!isOwner"
              :user-id="displayUserId" :is-following="isFollowing"
              @update:is-following="v => isFollowing = v" /> -->
          </div>
          <button type="button" class="detail-back-btn" aria-label="Quay lại" @click="goBack">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
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
          @like-updated="(count, isLiked) => {
            // Cập nhật số lượng
            post.like_count = count;
            if (post._count) post._count.likes = count;
            
            // FIX: Bắt buộc cập nhật trạng thái Tim để đồng bộ ra Feed
            if (isLiked !== undefined) {
              post.is_liked = isLiked;
            } else {
              post.is_liked = !post.is_liked; 
            }
          }"
          @focus-comment="focusInput" />

        <!-- Comments -->
        <CommentInput ref="commentInput" :highlight="commentHighlight" @submit="onSubmitComment" />
        <CommentList :comments="comments" />
      </div>
      </div>
    </div>
    <div v-else class="empty-state card">
      <p>Không tìm thấy nội dung bài đăng.</p>
      <router-link to="/feed">Trở về Feed</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePost }     from '@/composables/usePost'
import { useAuth }     from '@/composables/useAuth'
import { usePostStore } from '@/stores/postStore'
import UserAvatar     from '@/components/user/UserAvatar.vue'
import ResolutionBadge from '@/components/photo/ResolutionBadge.vue'
import PhotoActions   from '@/components/photo/PhotoActions.vue'
import CommentList    from '@/components/common/CommentList.vue'
import CommentInput   from '@/components/common/CommentInput.vue'
import BaseSpinner    from '@/components/base/BaseSpinner.vue'

const route = useRoute()
const router = useRouter()

function goBack() {
  // persist latest post state into store so Feed can sync immediately
  try {
    if (post.value && post.value.id) {
      postStore.setPost({ ...post.value })
    }
  } catch (e) {
    // ignore
  }
  if (window.history.length > 1) router.back()
  else router.push('/feed')
}
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
const commentHighlight = ref(false)
const currentImageIndex = ref(0)
const { post, comments, liked, loading, toggleLike, addComment } =
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

const imageUrls = computed(() => {
  const urls = getAllImageUrls(post.value)
  if (urls.length) return urls
  const single = getImageUrl(post.value)
  return single ? [single] : []
})

const hasMultipleImages = computed(() => imageUrls.value.length > 1)
const canGoPrev = computed(() => currentImageIndex.value > 0)
const canGoNext = computed(() => currentImageIndex.value < imageUrls.value.length - 1)

const currentImageUrl = computed(() => {
  if (!imageUrls.value.length) return ''
  return imageUrls.value[currentImageIndex.value] ?? imageUrls.value[0]
})

function prevImage() {
  currentImageIndex.value = Math.max(0, currentImageIndex.value - 1)
}

function nextImage() {
  currentImageIndex.value = Math.min(imageUrls.value.length - 1, currentImageIndex.value + 1)
}

const displayUserId = computed(
  () => post.value?.user_id ?? post.value?.user?.id ?? ''
)
const displayUsername = computed(
  () => post.value?.username ?? post.value?.user?.username ?? 'Người dùng'
)
const displayAvatar = computed(
  () => post.value?.avatar_url ?? post.value?.user?.avatar_url ?? null
)
const isOwner = computed(() => String(displayUserId.value) === String(userId.value))

/** Khung ảnh cố định theo ảnh lớn nhất — mũi tên không nhảy khi đổi slide */
const mediaBoxSize = ref(null)
const isMeasuringImages = ref(false)
let measureToken = 0

function loadImageSize(url) {
  return new Promise((resolve) => {
    const img = new Image()
    const done = () => resolve({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 })
    img.onload = done
    img.onerror = () => resolve({ w: 0, h: 0 })
    img.src = url
    // Ảnh đã cache (vào lại trang) — onload có thể không chạy
    if (img.complete) done()
  })
}

const INFO_COL_WIDTH = 300
const LAYOUT_BREAKPOINT = 768
/** Giới hạn kích thước vùng ảnh (giống Instagram, không quá to) */
const MAX_MEDIA_WIDTH = 560
const MAX_MEDIA_HEIGHT = 580

function getViewportLimits() {
  const isDesktop = window.innerWidth >= LAYOUT_BREAKPOINT
  const navHeight = 56
  const pagePad = 48
  const maxH = Math.min(
    MAX_MEDIA_HEIGHT,
    window.innerHeight - navHeight - 100
  )
  const maxW = isDesktop
    ? Math.min(
        MAX_MEDIA_WIDTH,
        window.innerWidth - INFO_COL_WIDTH - pagePad
      )
    : Math.min(MAX_MEDIA_WIDTH, window.innerWidth - 32)
  return {
    maxW: Math.max(240, maxW),
    maxH: Math.max(240, maxH),
  }
}

function fitDisplaySize(natW, natH, maxW, maxH) {
  const scale = Math.min(1, maxW / natW, maxH / natH)
  return {
    width: Math.round(natW * scale),
    height: Math.round(natH * scale),
  }
}

async function measureMediaBox(urls) {
  const token = ++measureToken
  isMeasuringImages.value = true
  mediaBoxSize.value = null

  if (!urls.length) {
    isMeasuringImages.value = false
    return
  }

  try {
    const sizes = await Promise.all(urls.map(loadImageSize))
    if (token !== measureToken) return

    let unionW = 0
    let unionH = 0
    for (const { w, h } of sizes) {
      if (w > unionW) unionW = w
      if (h > unionH) unionH = h
    }

    const { maxW, maxH } = getViewportLimits()
    if (unionW > 0 && unionH > 0) {
      mediaBoxSize.value = fitDisplaySize(unionW, unionH, maxW, maxH)
    } else {
      mediaBoxSize.value = fitDisplaySize(4, 5, maxW, maxH)
    }
  } finally {
    if (token === measureToken) isMeasuringImages.value = false
  }
}

const mediaStageStyle = computed(() => {
  if (!mediaBoxSize.value) return {}
  return {
    width: `${mediaBoxSize.value.width}px`,
    height: `${mediaBoxSize.value.height}px`,
  }
})

const mediaColStyle = computed(() => {
  if (!mediaBoxSize.value) return {}
  return {
    width: `${mediaBoxSize.value.width}px`,
    minWidth: `${mediaBoxSize.value.width}px`,
  }
})

let resizeTimer = null
function onWindowResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (imageUrls.value.length) measureMediaBox(imageUrls.value)
  }, 150)
}

function resetMediaMeasure() {
  measureToken++
  mediaBoxSize.value = null
  currentImageIndex.value = 0
}

watch(imageUrls, (urls) => {
  measureMediaBox(urls)
}, { immediate: true })

watch(postId, async () => {
  resetMediaMeasure()
  await nextTick()
  if (imageUrls.value.length) measureMediaBox(imageUrls.value)
})

onMounted(async () => {
  window.addEventListener('resize', onWindowResize)
  await nextTick()
  if (imageUrls.value.length) measureMediaBox(imageUrls.value)

  // Kiểm tra nếu cần focus vào ô nhập bình luận
  if (route.state?.focusComment) {
    await nextTick(); // Đảm bảo CommentInput đã được render
    commentHighlight.value = true
    focusInput();
    setTimeout(() => {
      commentHighlight.value = false
    }, 1200)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  clearTimeout(resizeTimer)
  measureToken++
  mediaBoxSize.value = null
})
</script>

<style scoped>
/* Căn giữa toàn bộ khung chi tiết bài đăng */
.post-detail-page {
  max-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.detail-back-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.detail-back-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.detail-back-btn svg {
  width: 20px;
  height: 20px;
}

.detail-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 8px;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.detail-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: min(880px, calc(100vw - 32px));
  margin: 0 auto;
  max-height: calc(100vh - var(--nav-height) - 48px);
}

@media (min-width: 768px) {
  .detail-layout {
    flex-direction: row;
    align-items: flex-start;
    width: auto;
    max-width: min(880px, calc(100vw - 32px));
  }
}

.detail-img-col {
  flex: 0 0 auto;
  width: 100%;
  max-width: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.detail-img-col--loading {
  min-height: 320px;
  min-width: 280px;
}

@media (min-width: 768px) {
  .detail-img-col {
    border-radius: 8px 0 0 8px;
  }
}

.media-stage {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  isolation: isolate;
}

.media-stage--measuring {
  opacity: 0.85;
}

.detail-img {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
}

/* Mũi tên kiểu Instagram: vòng tròn trắng mờ, chevron tối */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  transition: background 0.15s ease, transform 0.15s ease;
  padding: 0;
}

.carousel-arrow:hover:not(:disabled) {
  background: #fff;
  transform: translateY(-50%) scale(1.06);
}

.carousel-arrow--disabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

.carousel-arrow--prev {
  left: 14px;
}

.carousel-arrow--next {
  right: 14px;
}

.carousel-arrow svg {
  width: 16px;
  height: 16px;
}

/* Chấm tròn phân trang dưới ảnh */
.carousel-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  z-index: 2;
}

.carousel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  transition: background 0.15s ease, transform 0.15s ease;
}

.carousel-dot--active {
  background: #0095f6;
  transform: scale(1.15);
}

.detail-info-col {
  width: 100%;
  flex: 0 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  min-height: 200px;
  max-height: min(420px, calc(100vh - 120px));
}

@media (min-width: 768px) {
  .detail-info-col {
    width: 300px;
    flex: 0 0 300px;
    min-width: 300px;
    max-height: calc(100vh - 48px);
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    border-left: 1px solid var(--color-border);
  }
}

.detail-author {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  gap: 8px;
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
  flex-shrink: 0;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.detail-content,
.detail-caption {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--color-text-muted);
}
</style>
