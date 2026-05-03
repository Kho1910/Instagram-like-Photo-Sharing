<template>
  <div class="feed-layout">
    <div class="feed-main">
      <!-- Kiểm tra nếu mảng bài viết trống -->
      <div v-if="posts.length === 0" class="status">
        Bảng tin đang trống. Hãy đăng bài đầu tiên nhé!
      </div>
      
      <div v-else class="posts-list">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePostStore } from '@/stores/postStore';
import PostCard from '@/components/PostCard.vue';

const postStore = usePostStore();
const posts = computed(() => postStore.allPosts); 
</script>

<style scoped>
.feed-layout { max-width: 600px; margin: 0 auto; padding: 20px 0; }
.status { text-align: center; color: #8e8e8e; margin-top: 50px; }
</style>