<template>
  <nav class="navbar">
    <router-link to="/feed" class="navbar__logo">📷 PhotoShare</router-link>

    <div class="navbar__links">
      <router-link to="/feed"          class="nav-link" title="Feed">🏠</router-link>
      <router-link to="/upload"        class="nav-link" title="Upload">📤</router-link>
      <router-link to="/notifications" class="nav-link" title="Thông báo">
        🔔<span v-if="unreadCount > 0" class="notif-dot">{{ unreadCount }}</span>
      </router-link>
      <router-link :to="'/users/' + userId" class="nav-link" title="Profile">👤</router-link>
    </div>

    <button @click="handleLogout" class="logout-btn" title="Đăng xuất">Đăng xuất</button>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth }   from '@/composables/useAuth'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const { userId, logout }  = useAuth()
const { unreadCount }     = useNotification()

function handleLogout() { logout(); router.push('/login') }
</script>

<style scoped>
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: var(--nav-height);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.navbar__logo { font-size: 18px; font-weight: 700; }
.navbar__links { display: flex; gap: 20px; }
.nav-link { font-size: 20px; position: relative; opacity: .6; transition: opacity .15s; }
.nav-link:hover, .nav-link.router-link-active { opacity: 1; }
.notif-dot {
  position: absolute; top: -4px; right: -6px;
  background: var(--color-danger); color: #fff;
  font-size: 9px; font-weight: 700; border-radius: var(--radius-full);
  padding: 1px 4px;
}
.logout-btn { font-size: 18px; border: none; background: none;
  opacity: .5; transition: opacity .15s; }
.logout-btn:hover { opacity: 1; }
</style>
