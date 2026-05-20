<!-- frontend/src/views/ProfileView.vue -->
<template>
  <div class="page-wrap">
    <div v-if="loading" class="loader-center">
      <div class="spinner"></div>
    </div>

    <template v-else-if="profile">
      <h1 class="page-heading">Profile</h1>
      <!-- Header -->
      <div class="profile-header">
        <div class="avatar-lg">
          <img v-if="profile.avatar_url" :src="profile.avatar_url" />
          <span v-else>{{ profile.username?.[0]?.toUpperCase() || '?' }}</span>
        </div>

        <div class="profile-meta">
          <div class="profile-top">
            <div class="profile-info">
              <h2 class="profile-username">{{ profile.username }}</h2>
              <p v-if="profile.fullname" class="full-name">{{ profile.fullname }}</p>
              <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
              <div class="profile-stats">
                <div class="stat"><strong>{{ totalPosts }}</strong><span>bài đăng</span></div>
                <!-- <div class="stat"><strong>0</strong><span>followers</span></div>
                <div class="stat"><strong>0</strong><span>following</span></div> -->
              </div>
            </div>

            <div class="profile-actions">
              <button class="edit-btn" @click="startEdit" v-if="!editMode">
                Chỉnh sửa profile
              </button>
              <router-link to="/upload" class="upload-link">
                + Upload ảnh
              </router-link>
            </div>
          </div>

          <div v-if="editMode" class="profile-edit-form">
            <input v-model="editData.full_name" placeholder="Họ và tên" />
            <textarea v-model="editData.bio" placeholder="Tiểu sử" rows="3" />
            <div class="edit-actions">
              <button class="save-btn" @click="saveProfile">Lưu</button>
              <button class="cancel-btn" @click="cancelEdit">Hủy</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid ảnh (lazy load khi cuộn) -->
      <InfiniteScroll :loading="isLoadingMore" :hasMore="hasMore" @load-more="loadMorePosts">
        <div v-if="posts.length > 0" class="photo-grid" >
          <div v-for="post in posts" :key="post.id" class="grid-item" @click.stop="openPost(post)">
            <!-- medias là array, lấy ảnh đầu tiên -->
            <img
              v-if="post.medias && post.medias[0]"
              :src="buildUrl(post.medias[0].public_id)"
              loading="lazy"
            />
            <div class="grid-overlay">
              <span>♥ {{ post._count?.likes || 0 }}</span>
              <span>💬 {{ post._count?.comments || 0 }}</span>
            </div>
          </div>
        </div>
      </InfiniteScroll>

    </template>

    <div v-else class="empty-state">
      <p>📷 Chưa có ảnh nào.</p>
      <router-link v-if="isMe" to="/upload">Upload ảnh đầu tiên →</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth }     from '@/composables/useAuth'
import { userService } from '@/services/userService'
import { usePostStore } from '@/stores/postStore'

const route  = useRoute()
const router = useRouter()
const postStore = usePostStore()
const { user: authUser } = useAuth()

const profile     = ref(null)
const posts       = ref([])
const loading     = ref(true)
const totalPosts  = ref(0)
const hasMore     = ref(false)
const nextCursor  = ref(null)
const isLoadingMore = ref(false)
const editMode    = ref(false)
const editData    = reactive({ full_name: '', bio: '' })
const PAGE_SIZE   = 12

// So sánh string để tránh type mismatch
const isMe = computed(() =>
  String(route.params.id) === String(authUser.value?.id)
)

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
function buildUrl(publicId) {
  if (!CLOUD || !publicId) return ''
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${publicId}`
}

async function fetchAll() {
  loading.value = true
  try {
    const uid = parseInt(route.params.id)
    if (!uid || isNaN(uid)) {
      console.error('userId không hợp lệ:', route.params.id)
      loading.value = false
      return
    }

    // Gọi song song
    const [prof, postsResult] = await Promise.all([
      userService.getProfile(uid),
    userService.getUserPosts(uid, PAGE_SIZE)
    ])

    profile.value = prof
    profile.value.id = uid
    // postsResult = { posts, hasMore, nextCursor }
    posts.value     = postsResult?.posts || []
    totalPosts.value = posts.value.length
    hasMore.value    = Boolean(postsResult?.hasMore)
    nextCursor.value = postsResult?.nextCursor ?? null
  } catch(e) {
    console.error('Lỗi:', e.message)
  } finally {
    loading.value = false
  }
}

async function loadMorePosts() {
  if (!hasMore.value || !nextCursor.value) return
  isLoadingMore.value = true
  try {
    const uid = parseInt(route.params.id)
    const postsResult = await userService.getUserPosts(uid, PAGE_SIZE, nextCursor.value)
    const nextPosts = postsResult?.posts || []
    posts.value.push(...nextPosts)
    totalPosts.value = posts.value.length
    hasMore.value = Boolean(postsResult?.hasMore)
    nextCursor.value = postsResult?.nextCursor ?? null
  } catch (e) {
    console.error('Không thể tải thêm bài đăng:', e.message)
  } finally {
    isLoadingMore.value = false
  }
}

function startEdit() {
  editMode.value = true
  editData.full_name = profile.value?.fullname || ''
  editData.bio = profile.value?.bio || ''
}

function cancelEdit() {
  editMode.value = false
}

async function saveProfile() {
  if (!profile.value) return
  try {
    const updated = await userService.updateProfile({
      full_name: editData.full_name,
      bio: editData.bio
    })
    profile.value = updated
    editMode.value = false
  } catch (e) {
    console.error('Cập nhật profile thất bại:', e.message)
  }
}

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

onMounted(fetchAll)
</script>

<style scoped>
.profile-header {
  display: flex;
  gap: 28px;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.page-heading { font-size:24px; font-weight:700; margin-bottom:22px; }
.avatar-lg {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-lg img { width:100%; height:100%; object-fit:cover; }
.profile-meta { flex: 1; min-width: 0; }
.profile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.profile-username {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}
.profile-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.follow-btn { padding:6px 16px; border-radius:20px; font-size:13px;
  font-weight:600; border:1.5px solid var(--color-primary);
  color:var(--color-primary); background:transparent; cursor:pointer; }
.follow-btn:hover { background:var(--color-primary); color:#fff; }
.follow-btn.following { background:#e2e8f0; border-color:#e2e8f0; color:#718096; }
.upload-link { font-size:13px; font-weight:600; color:var(--color-primary);
  border:1.5px solid var(--color-primary); padding:6px 14px; border-radius:20px; }
.edit-btn, .save-btn, .load-more-btn {
  padding: 8px 14px; border-radius: 20px; border: 1px solid var(--color-border);
  background: #fff; color: var(--color-text); cursor: pointer;
}
.edit-btn {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.edit-btn:hover {
  background: #fff;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.save-btn { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.cancel-btn {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
  padding: 6px 14px;
  border-radius: 20px;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.cancel-btn:hover {
  background: var(--color-primary);
  color: #fff;
}
.upload-link {
  font-size: 13px; font-weight: 600; color: var(--color-primary);
  border: 1.5px solid var(--color-primary); padding: 6px 14px; border-radius: 20px;
  transition: background 0.2s ease, color 0.2s ease;
}
.upload-link:hover {
  background: var(--color-primary);
  color: #fff;
}
.load-more-btn { margin: 24px auto 0; display: block; }
.profile-edit-form { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.profile-edit-form input,
.profile-edit-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-surface);
  color: var(--color-text);
}
.profile-edit-form input::placeholder,
.profile-edit-form textarea::placeholder {
  color: var(--color-text-muted);
}
.profile-edit-form input:focus,
.profile-edit-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}
.profile-edit-form input:-webkit-autofill,
.profile-edit-form input:-webkit-autofill:hover,
.profile-edit-form input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--color-text);
  box-shadow: 0 0 0 1000px var(--color-surface) inset;
  caret-color: var(--color-text);
}
.edit-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.profile-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 28px;
}

.stat {
  display: inline-flex;
  flex-direction: row;
  align-items: baseline;
  gap: 5px;
  white-space: nowrap;
}

.stat strong {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.stat span {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.2;
}
.full-name { margin: 0; font-weight:600; font-size:14px; }
.bio { margin: 0; font-size:13px; color:#718096; line-height: 1.4; }

.photo-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:3px; }
.grid-item { position:relative; aspect-ratio:1; overflow:hidden; cursor:pointer; }
.grid-item img { width:100%; height:100%; object-fit:cover; transition:transform .2s; }
.grid-item:hover img { transform:scale(1.05); }
.grid-overlay { position:absolute; inset:0; background:rgba(0,0,0,.35);
  display:flex; align-items:center; justify-content:center;
  gap:16px; color:#fff; font-weight:600; opacity:0; transition:opacity .2s; }
.grid-item:hover .grid-overlay { opacity:1; }

.loader-center { display:flex; justify-content:center; padding:48px; }
.spinner { width:32px; height:32px; border-radius:50%;
  border:3px solid #e2e8f0; border-top-color:var(--color-primary);
  animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.empty-state { text-align:center; padding:48px; color:#718096; }
.empty-state a { color:var(--color-primary); font-weight:600; }
</style>
