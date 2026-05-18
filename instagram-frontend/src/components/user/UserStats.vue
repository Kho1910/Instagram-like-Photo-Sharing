<template>
  <div class="stats">
    <div class="stat"><strong>{{ user.photo_count || 0 }}</strong><span>ảnh</span></div>
    <div class="stat"><strong>{{ user.follower_count || 0 }}</strong><span>followers</span></div>
    <div class="stat"><strong>{{ user.following_count || 0 }}</strong><span>following</span></div>
  </div>
</template>
<script setup>
defineProps({ user: Object })
</script>
<style scoped>
.stats { display: flex; gap: 24px; }
.stat { display: flex; flex-direction: column; align-items: center; font-size: 13px; color: var(--color-text-muted); }
.stat strong { font-size: 17px; color: var(--color-text); font-weight: 700; }
</style>
