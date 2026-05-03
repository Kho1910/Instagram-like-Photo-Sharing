import { defineStore } from 'pinia';
import { mockPosts } from '@/api/mockData';

export const usePostStore = defineStore('post', {
  state: () => ({
    // Ưu tiên lấy từ máy ra, nếu không có mới dùng mockPosts
    allPosts: JSON.parse(localStorage.getItem('all_posts_test')) || [...mockPosts] 
  }),
  actions: {
    addPost(newPost) {
      this.allPosts.unshift(newPost);
      // Lưu lại vào localStorage ngay khi có bài mới
      localStorage.setItem('all_posts_test', JSON.stringify(this.allPosts));
    }
  }
});