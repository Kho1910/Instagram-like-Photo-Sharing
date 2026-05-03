<template>
  <div class="app-layout">
    <!-- Navbar chỉ hiện khi đã đăng nhập -->
    <header> 
        <Navbar />
    </header>

    <main class="content-area">
      <!-- Thêm :key để Vue nhận biết sự thay đổi URL hoàn toàn -->
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<style>
/* CSS Reset đơn giản */
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; }
.content-area { max-width: 935px; margin: 0 auto; padding: 20px; }
</style>