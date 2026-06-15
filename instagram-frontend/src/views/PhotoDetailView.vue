<template>
  <div class="page-wrap post-detail-page">
    <BaseSpinner v-if="loading && !post" label="Đang tải..." />

    <div v-else-if="post" class="detail-shell">
      <div class="detail-layout card" :style="detailLayoutStyle">
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
              <UserAvatar :username="displayUsername" :src="displayAvatar" :size="32" />
              <strong>{{ displayUsername }}</strong>
            </router-link>
          </div>
          <button type="button" class="detail-back-btn" aria-label="Quay lại" @click="goBack">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <div class="detail-info-scroll">
          <div class="detail-badge">
            <ResolutionBadge :tier="post.resolution_tier" :status="post.status" />
          </div>

          <div v-if="post.title || post.content || post.caption" class="detail-caption-block">
            <router-link :to="'/users/' + displayUserId" class="caption-author">{{ displayUsername }}</router-link>
            <p v-if="post.title" class="detail-title">{{ post.title }}</p>
            <p v-if="post.content" class="detail-content">{{ post.content }}</p>
            <p v-else-if="post.caption" class="detail-caption">{{ post.caption }}</p>
          </div>

          <CommentList :comments="comments" />
        </div>

        <div class="detail-info-footer">
          <PhotoActions
            :post="post"
            @like-updated="(count, isLiked) => {
              post.like_count = count
              if (post._count) post._count.likes = count
              if (isLiked !== undefined) {
                post.is_liked = isLiked
              } else {
                post.is_liked = !post.is_liked
              }
            }"
            @focus-comment="focusInput"
          />
          <CommentInput ref="commentInput" :highlight="commentHighlight" @submit="onSubmitComment" />
        </div>
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

/** Kích thước khung media (ổn định theo viewport + tỉ lệ, không theo pixel ảnh gốc) */
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

const INFO_COL_WIDTH = 390
const LAYOUT_BREAKPOINT = 768
/** Khoảng trống trên + dưới modal (Instagram để ~50–60px mỗi bên) */
const VIEWPORT_V_MARGIN = 120
const VIEWPORT_H_MARGIN = 48
const SIDE_NAV_OFFSET = 72
/** Khung media tối thiểu — ảnh nhỏ vẫn có hộp đủ lớn nhưng không quá cao */
const MIN_MEDIA_WIDTH = 480
const MIN_MEDIA_HEIGHT = 400
/** Trần chiều cao khung media (desktop) — tránh modal gần full màn hình */
const MAX_MEDIA_HEIGHT_DESKTOP = 700
/** Giới hạn tỉ lệ hiển thị (tránh panorama cực rộng kéo layout) */
const MIN_DISPLAY_ASPECT = 0.8
const MAX_DISPLAY_ASPECT = 1.91

function getViewportLimits() {
  const isDesktop = window.innerWidth >= LAYOUT_BREAKPOINT
  const maxH = isDesktop
    ? Math.min(window.innerHeight - VIEWPORT_V_MARGIN, MAX_MEDIA_HEIGHT_DESKTOP)
    : Math.min(window.innerHeight - 96, 480)
  const maxW = isDesktop
    ? window.innerWidth - SIDE_NAV_OFFSET - INFO_COL_WIDTH - VIEWPORT_H_MARGIN
    : window.innerWidth - 24
  const minW = isDesktop ? MIN_MEDIA_WIDTH : 280
  const minH = isDesktop ? MIN_MEDIA_HEIGHT : 280
  return {
    maxW: Math.max(minW, maxW),
    maxH: Math.max(minH, maxH),
    minW,
    minH,
  }
}

function clampDisplayAspect(natW, natH) {
  if (!natW || !natH) return 4 / 5
  const raw = natW / natH
  return Math.max(MIN_DISPLAY_ASPECT, Math.min(MAX_DISPLAY_ASPECT, raw))
}

/**
 * Kích thước khung media theo tỉ lệ + min/max viewport,
 * không scale theo pixel gốc của ảnh (ảnh nhỏ/to đều nằm trong khung cố định).
 */
function computeMediaFrameSize(natW, natH, limits) {
  const aspect = clampDisplayAspect(natW, natH)

  let width = limits.maxW
  let height = width / aspect

  if (height > limits.maxH) {
    height = limits.maxH
    width = height * aspect
  }

  width = Math.max(width, limits.minW)
  height = Math.max(height, limits.minH)

  if (width > limits.maxW || height > limits.maxH) {
    const scale = Math.min(limits.maxW / width, limits.maxH / height)
    width *= scale
    height *= scale
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
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

    const limits = getViewportLimits()
    const frames = sizes.map(({ w, h }) => computeMediaFrameSize(w, h, limits))

    let width = limits.minW
    let height = limits.minH
    for (const frame of frames) {
      if (frame.width > width) width = frame.width
      if (frame.height > height) height = frame.height
    }

    if (width > limits.maxW || height > limits.maxH) {
      const scale = Math.min(limits.maxW / width, limits.maxH / height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    mediaBoxSize.value = { width, height }
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
    height: `${mediaBoxSize.value.height}px`,
  }
})

const detailLayoutStyle = computed(() => {
  const maxH = `min(calc(100vh - ${VIEWPORT_V_MARGIN}px), ${MAX_MEDIA_HEIGHT_DESKTOP}px)`
  if (!mediaBoxSize.value) {
    return { maxHeight: maxH }
  }
  return {
    height: `${mediaBoxSize.value.height}px`,
    maxHeight: maxH,
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
/* Trang chi tiết: full vùng nội dung, căn giữa modal kiểu Instagram */
.post-detail-page.page-wrap {
  max-width: none;
  width: 100%;
  min-height: calc(100vh - 24px);
  padding: 48px 24px 48px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.detail-info-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 16px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
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
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
  max-width: calc(100vw - 48px);
  margin: 0 auto;
  max-height: min(calc(100vh - 120px), 620px);
  border: 1px solid var(--color-border);
}

@media (min-width: 768px) {
  .detail-layout {
    flex-direction: row;
    align-items: stretch;
    width: auto;
    max-width: calc(100vw - 72px - 48px);
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
  min-height: 400px;
  min-width: 480px;
}

@media (max-width: 767px) {
  .detail-img-col--loading {
    min-height: 320px;
    min-width: 280px;
  }
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
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  min-height: 280px;
  max-height: min(50vh, 480px);
}

@media (min-width: 768px) {
  .detail-info-col {
    width: 390px;
    flex: 0 0 390px;
    min-width: 390px;
    max-width: 390px;
    min-height: 400px;
    max-height: none;
    height: auto;
    align-self: stretch;
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    border-left: 1px solid var(--color-border);
  }
}

.detail-info-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px 12px;
}

.detail-info-footer {
  flex-shrink: 0;
  padding: 0 16px 12px;
  border-top: 1px solid var(--color-border);
}

.detail-caption-block {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.45;
}

.caption-author {
  font-weight: 600;
  margin-right: 6px;
  color: var(--color-text);
  text-decoration: none;
}

.caption-author:hover {
  text-decoration: underline;
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
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0 0;
}

.detail-content,
.detail-caption {
  font-size: 14px;
  margin: 4px 0 0;
  color: var(--color-text);
  white-space: pre-wrap;
}

@media (max-width: 767px) {
  .post-detail-page.page-wrap {
    padding: 16px 12px 24px;
    justify-content: flex-start;
  }

  .detail-layout {
    max-height: none;
  }

  .detail-info-col {
    max-height: min(45vh, 400px);
  }
}
</style>
