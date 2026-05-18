<template>
  <div class="page-wrap">
    <h2 class="page-heading">🔍 Khám phá</h2>

    <BaseSpinner v-if="loading && posts.length === 0" label="Đang tải..." />

    <PhotoGrid :posts="posts" @select.stop="openPost" />

    <InfiniteScroll :loading="loading" :has-more="hasMore" @load-more="loadMore" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'
import { useExplore }  from '@/composables/useExplore'
import PhotoGrid      from '@/components/photo/PhotoGrid.vue'
import BaseSpinner    from '@/components/base/BaseSpinner.vue'
import InfiniteScroll from '@/components/common/InfiniteScroll.vue'

const router = useRouter()
const postStore = usePostStore()
const { posts, loading, hasMore, loadMore } = useExplore()

function openPost(post) {
  const plainPost = JSON.parse(JSON.stringify(post))
  postStore.setSelectedPost(plainPost)
  sessionStorage.setItem('selectedPost', JSON.stringify(plainPost))
  router.push({
    name: 'post-detail',
    params: { id: plainPost.id },
    state: { post: plainPost }
  })
}
</script>

<style scoped>
.page-heading { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
</style>
