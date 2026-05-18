<template>
  <div class="avatar" :style="{ width: size+'px', height: size+'px', fontSize: size/2.5+'px' }">
    <img v-if="src" :src="src" :alt="username" />
    <span v-else>{{ username?.[0]?.toUpperCase() || '?' }}</span>
  </div>
</template>
<script setup>
defineProps({ username: String, src: String, size: { type: Number, default: 36 } })
</script>
<style scoped>
.avatar { border-radius: 50%; background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; overflow: hidden; flex-shrink: 0; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
</style>
