<template>
  <div class="actions">
    <LikeButton v-model="liked" :count="post.like_count ?? post._count?.likes ?? 0" @toggle="onLike" />
    <button class="comment-btn" @click="$emit('focus-comment')">
      💬 <span>{{ post.comment_count ?? post._count?.comments ?? 0 }}</span>
    </button>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import LikeButton from '@/components/common/LikeButton.vue'
import { interactionService } from '@/services/interactionService'
import { usePostStore } from '@/stores/postStore'
const props = defineProps({ post: Object })
const emit  = defineEmits(['like-updated', 'focus-comment'])
const liked = ref(props.post.is_liked || false)

// keep internal liked state in sync when parent/post store updates
watch(() => props.post?.is_liked, (v) => {
  liked.value = v ?? false
})
const postStore = usePostStore()

function getPostId() {
  return props.post?.id ?? null
}

async function onLike(newLiked) {
  const postId = getPostId()
  if (!postId) return

  const previousCount = props.post.like_count ?? props.post._count?.likes ?? 0
  const nextCount = previousCount + (newLiked ? 1 : -1)
  const previousLiked = liked.value

  liked.value = newLiked
  props.post.is_liked = newLiked
  props.post.like_count = nextCount
  // persist optimistic change to store so navigation back preserves state
  if (props.post?.id) postStore.setPost({ ...props.post })
  emit('like-updated', nextCount)

  try {
    const res = newLiked
      ? await interactionService.like(postId)
      : await interactionService.unlike(postId)

    if (typeof res.like_count === 'number') {
      props.post.like_count = res.like_count
      if (props.post?.id) postStore.setPost({ ...props.post, like_count: res.like_count, is_liked: newLiked })
      emit('like-updated', res.like_count)
    }
  } catch {
    liked.value = previousLiked
    props.post.is_liked = previousLiked
    props.post.like_count = previousCount
    if (props.post?.id) postStore.setPost({ ...props.post, like_count: previousCount, is_liked: previousLiked })
    emit('like-updated', previousCount)
  }
}
</script>
<style scoped>
.actions { display: flex; gap: 14px; align-items: center; padding: 8px 0; }
.comment-btn { display: flex; align-items: center; gap: 5px; border: none;
  background: none; font-size: 20px; color: var(--color-text-muted); }
.comment-btn span { font-size: 13px; font-weight: 600; }
</style>
