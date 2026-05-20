export const FEED_CACHE_KEY = 'feedCache_v1'

/** Cập nhật avatar_url của user trong danh sách bài (dùng cho Feed đang hiển thị). */
export function patchPostsAvatarInList(posts, userId, avatarUrl) {
  if (!posts?.length || userId == null || !avatarUrl) return
  const uid = String(userId)
  posts.forEach((post) => {
    const postUserId = String(post.user_id ?? post.user?.id ?? '')
    if (postUserId !== uid) return
    post.avatar_url = avatarUrl
    if (post.user) post.user.avatar_url = avatarUrl
  })
}

/** Đồng bộ avatar vào sessionStorage feed cache (khi quay lại Feed sau khi sửa profile). */
export function patchFeedAvatarInCache(userId, avatarUrl) {
  if (userId == null || !avatarUrl) return
  try {
    const raw = sessionStorage.getItem(FEED_CACHE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (!Array.isArray(data.posts)) return
    patchPostsAvatarInList(data.posts, userId, avatarUrl)
    sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota / parse errors
  }
}
