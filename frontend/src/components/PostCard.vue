<template>
  <div class="post-card">
    <!-- Header: Avatar + Tên -->
    <div class="post-header">
      <img :src="post.user.avatar" class="mini-avatar" alt="avatar" />
      <span class="username">{{ post.user.username }}</span>
    </div>

    <!-- Ảnh bài đăng -->
    <div class="post-image-container">
      <img :src="post.imageUrl" class="post-image" loading="lazy" />
    </div>

    <!-- Tương tác: Like, Caption, Ngày tháng -->
    <div class="post-content">
      <div class="actions">
        <button class="btn-heart">❤️ {{ post.likes }}</button>
        <button class="btn-comment">💬</button>
      </div>
      <p class="caption">
        <strong>{{ post.user.username }}</strong> {{ post.caption }}
      </p>
      <span class="timestamp">{{ formatDate(post.createdAt) }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  post: Object
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};
</script>

<style scoped>
.post-card { background: white; border: 1px solid #dbdbdb; margin-bottom: 25px; border-radius: 8px; overflow: hidden; }
.post-header { padding: 12px; display: flex; align-items: center; }
.mini-avatar { width: 32px; height: 32px; border-radius: 50%; margin-right: 10px; }
.username { font-weight: 600; font-size: 14px; }
.post-image { width: 100%; display: block; object-fit: cover; aspect-ratio: 1 / 1; }
.post-content { padding: 12px; }
.actions { margin-bottom: 8px; }
.actions button { background: none; border: none; font-size: 18px; cursor: pointer; margin-right: 15px; }
.caption { font-size: 14px; margin: 5px 0; }
.timestamp { font-size: 10px; color: #8e8e8e; text-transform: uppercase; }
</style>