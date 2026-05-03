<template>
  <nav class="navbar">
    <div class="nav-content">
      <router-link to="/feed" class="logo">Instagram Clone</router-link>
      
      <div class="nav-links">
        <router-link to="/feed">🏠 Home</router-link>
        <router-link to="/upload">➕ New Post</router-link>
        <router-link :to="`/profile/${authStore.user?.username || 'dangkhoa_it'}`">
        👤 Profile
        </router-link>        
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar { background: white; border-bottom: 1px solid #dbdbdb; padding: 10px 0; position: sticky; top: 0; z-index: 100; }
.nav-content { max-width: 935px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
.logo { font-size: 20px; font-weight: bold; text-decoration: none; color: black; }
.nav-links a, .nav-links button { margin-left: 20px; text-decoration: none; color: #262626; background: none; border: none; cursor: pointer; font-size: 16px; }
</style>