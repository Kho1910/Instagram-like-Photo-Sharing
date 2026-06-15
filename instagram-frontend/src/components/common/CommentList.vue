<template>
  <div class="comment-section">
    <div class="comment-list">
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <router-link :to="'/users/'+c.user_id" class="comment-author">{{ c.username }}</router-link>
        <span class="comment-text">{{ c.content }}</span>
      </div>
      <div v-if="comments.length === 0" class="no-comments">Chưa có bình luận nào.</div>
    </div>
  </div>
</template>
<script setup>
defineProps({ comments: { type: Array, default: () => [] } })
</script>
<style scoped>
.comment-list { max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.comment-item { font-size: 13px; }
.comment-author { font-weight: 600; margin-right: 6px; color: var(--color-text); }
.comment-text { color: var(--color-text); }
.no-comments { font-size: 12px; color: var(--color-text-muted); text-align: center; padding: 16px 0; }
</style>
