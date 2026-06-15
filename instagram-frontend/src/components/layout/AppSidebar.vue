<!-- Sidebar hiện "Suggested users" — dùng trên desktop bên phải Feed -->
<template>
  <aside class="sidebar">
    <p class="sidebar__title">Gợi ý cho bạn</p>
    <div v-for="u in suggested" :key="u.id" class="sidebar__user">
      <router-link :to="'/users/' + u.id" class="sidebar__info">
        <UserAvatar :username="u.username" :size="32" />
        <span>{{ u.username }}</span>
      </router-link>
      <FollowButton :user-id="u.id" :is-following="u.is_following" size="sm" />
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { discoveryService } from '@/services/discoveryService'
import UserAvatar  from '@/components/user/UserAvatar.vue'
import FollowButton from '@/components/user/FollowButton.vue'

const suggested = ref([])
onMounted(async () => { suggested.value = await discoveryService.getSuggested() })
</script>

<style scoped>
.sidebar { width: 220px; flex-shrink: 0; padding-top: 8px; }
.sidebar__title { font-size: 12px; font-weight: 600; color: var(--color-text-muted);
  margin-bottom: 12px; text-transform: uppercase; letter-spacing: .05em; }
.sidebar__user { display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px; }
.sidebar__info { display: flex; align-items: center; gap: 8px; font-size: 13px;
  font-weight: 500; text-decoration: none; color: var(--color-text); }
</style>
