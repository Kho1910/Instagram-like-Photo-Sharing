<template>
  <div class="not-found">
    <p class="not-found__icon">🔍</p>
    <h2>Trang không tồn tại</h2>
    <router-link to="/feed">← Về trang chủ</router-link>
  </div>
</template>
<style scoped>
.not-found { text-align: center; padding: 80px 16px; }
.not-found__icon { font-size: 60px; margin-bottom: 16px; }
.not-found h2 { font-size: 22px; margin-bottom: 16px; }
.not-found a  { color: var(--color-primary); font-weight: 600; }
</style>
