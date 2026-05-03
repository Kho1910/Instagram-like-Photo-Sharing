<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePostStore } from '@/stores/postStore'
import { mockUser } from '@/api/mockData'

const route = useRoute()
const postStore = usePostStore()

// Lấy thông tin user từ mock (sau này sẽ lấy từ Store)
const user = mockUser

// Lọc bài viết từ Store chung dựa trên username trên URL
const posts = computed(() => {
  const username = route.params.username
  return postStore.allPosts.filter(p => p.user.username === username)
})
</script>

<template>
  <div class="profile-container">
    <header class="profile-header">
      <div class="avatar-wrapper">
        <img :src="user.avatar" class="profile-avatar" />
      </div>
      <div class="profile-bio">
        <h2 class="username">{{ user.username }}</h2>
        <p class="stats"><strong>{{ posts.length }}</strong> bài viết</p>
        <p class="bio-text">{{ user.bio }}</p>
      </div>
    </header>

    <hr class="divider" />

    <!-- Lưới ảnh 3 cột chuẩn Instagram -->
    <div class="photo-grid">
      <div v-for="post in posts" :key="post.id" class="grid-item">
        <img :src="post.imageUrl" class="grid-img" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container { max-width: 935px; margin: 0 auto; padding: 30px 20px; }
.profile-header { display: flex; align-items: center; margin-bottom: 44px; }
.avatar-wrapper { flex: 1; display: flex; justify-content: center; }
.profile-avatar { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 1px solid #dbdbdb; }
.profile-bio { flex: 2; }
.username { font-size: 28px; font-weight: 300; margin-bottom: 20px; }
.stats { margin-bottom: 20px; }
.divider { border: 0; border-top: 1px solid #dbdbdb; margin-bottom: 28px; }

/* Quan trọng: CSS Grid cho 3 cột */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.grid-item { aspect-ratio: 1 / 1; overflow: hidden; }
.grid-img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>