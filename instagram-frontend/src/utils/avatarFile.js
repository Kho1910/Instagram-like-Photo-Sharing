const ALLOWED_AVATAR_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

const BLOCKED_EXTENSIONS = new Set([
  'gif', 'mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'mpeg', 'mpg',
])

export const AVATAR_FILE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'

export function validateAvatarFile(file) {
  if (!file) {
    return { ok: false, message: 'Không có file được chọn.' }
  }

  const ext = file.name?.split('.').pop()?.toLowerCase() ?? ''
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      message: 'Không dùng GIF hoặc video làm avatar. Chỉ chấp nhận JPG, PNG hoặc WEBP.',
    }
  }

  if (file.type === 'image/gif' || file.type.startsWith('video/')) {
    return {
      ok: false,
      message: 'Không dùng GIF hoặc video làm avatar. Chỉ chấp nhận JPG, PNG hoặc WEBP.',
    }
  }

  if (!file.type.startsWith('image/')) {
    return {
      ok: false,
      message: 'Vui lòng chọn file ảnh (JPG, PNG hoặc WEBP).',
    }
  }

  if (!ALLOWED_AVATAR_MIME.has(file.type)) {
    return {
      ok: false,
      message: 'Định dạng ảnh không hỗ trợ. Chỉ chấp nhận JPG, PNG hoặc WEBP.',
    }
  }

  return { ok: true }
}
