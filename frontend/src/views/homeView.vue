<template>
  <div class="home-view">
    <h1>Chào mừng đến với Instagram Clone</h1>
    <p>Bạn sẽ được chuyển đến bảng tin nếu đã đăng nhập.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    router.replace('/feed')
  } else {
    router.replace('/login')
  }
})
</script>

<style scoped>
.home-view { text-align: center; margin-top: 120px; color: #333; }
</style>
