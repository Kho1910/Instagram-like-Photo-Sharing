<!-- Dùng trong ExploreView và ProfileView: grid 3 cột -->
<template>
  <div class="photo-grid">
    <div
      v-for="post in posts"
      :key="post.id"
      class="grid-item"
      @click="$emit('select', post)"
    >
      <img :src="post.resized_url || post.original_url" loading="lazy" />
      <div class="grid-overlay">
        <span>♥ {{ post.like_count || 0 }}</span>
        <span>💬 {{ post.comment_count || 0 }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({ posts: { type: Array, default: () => [] } })
defineEmits(['select'])
</script>
<style scoped>
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.grid-item  { position: relative; aspect-ratio: 1; overflow: hidden; cursor: pointer; }
.grid-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .25s; }
.grid-item:hover img { transform: scale(1.06); }
.grid-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,.38);
  display: flex; align-items: center; justify-content: center; gap: 16px;
  color: #fff; font-weight: 700; font-size: 14px;
  opacity: 0; transition: opacity .2s;
}
.grid-item:hover .grid-overlay { opacity: 1; }
</style>
