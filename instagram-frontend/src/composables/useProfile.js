import { ref, onMounted } from 'vue'
import { userService } from '@/services/userService'
import { postService } from '@/services/postService'

export function useProfile(userId) {
  const user    = ref(null)
  const posts   = ref([])
  const loading = ref(true)

  async function fetchAll() {
    loading.value = true
    ;[user.value, posts.value] = await Promise.all([
      userService.getProfile(userId),
      postService.getUserPosts(userId)
    ])
    loading.value = false
  }

  async function toggleFollow() {
    if (!user.value) return
    if (user.value.is_following) {
      await userService.unfollow(userId)
      user.value.is_following = false; user.value.follower_count--
    } else {
      await userService.follow(userId)
      user.value.is_following = true;  user.value.follower_count++
    }
  }

  onMounted(fetchAll)
  return { user, posts, loading, toggleFollow }
}
