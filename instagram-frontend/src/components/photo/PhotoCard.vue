<!-- Dùng trong FeedView: 1 bài đăng dạng card -->
<template>
  <article class="photo-card card">
    <!-- Header -->
    <div class="card__header">
      <router-link :to="'/users/' + post.user_id" class="card__user">
        <UserAvatar :username="post.username" :src="post.avatar_url" :size="36" />
        <span class="card__username">{{ post.username }}</span>
      </router-link>
      <span class="card__date">{{ formatDate(post.created_at) }}</span>
    </div>

    <!-- Ảnh -->
    <router-link :to="'/posts/' + post.id">
      <img
        :src="post.resized_url || post.original_url"
        :alt="post.username"
        class="card__img"
        loading="lazy"
      />
    </router-link>

    <!-- Actions -->
    <div class="card__body">
      <PhotoActions :post="postData" @like-updated="n => postData.like_count = n" />
      <p v-if="post.caption" class="card__caption">
        <strong>{{ post.username }}</strong> {{ post.caption }}
      </p>
      <router-link :to="'/posts/' + post.id" class="card__comments-link">
        Xem tất cả {{ post.comment_count || 0 }} bình luận
      </router-link>
    </div>
  </article>
</template>

<script setup>
import { reactive } from 'vue'
import { formatDate } from '@/utils/formatters'
import UserAvatar  from '@/components/user/UserAvatar.vue'
import PhotoActions from './PhotoActions.vue'

const props = defineProps({ post: Object })
// Local reactive copy để update optimistically
const postData = reactive({ ...props.post })
</script>

<style scoped>
.photo-card { margin-bottom: 20px; }
.card__header { display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; }
.card__user { display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: var(--color-text); }
.card__username { font-weight: 600; font-size: 14px; }
.card__date  { font-size: 12px; color: var(--color-text-muted); }
.card__img   { width: 100%; aspect-ratio: 1; object-fit: cover; }
.card__body  { padding: 8px 14px 14px; }
.card__caption { font-size: 13px; margin: 6px 0; }
.card__comments-link { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; display: block; }
</style>
