// instagram-frontend/src/services/mediaService.js
// Flow: get signature → upload Cloudinary → confirm backend
import api from '@/api'

export const mediaService = {
  /**
   * Bước 1: Xin signature từ backend
   * POST /api/medias/upload-signature
   * Returns: { signature, timestamp, folder, api_key, cloud_name }
   */
  async getSignature() {
    const { data } = await api.post('/medias/upload-signature')
    return data.data
  },

  /**
   * Bước 2: Upload file thẳng lên Cloudinary (không qua backend)
   * Dùng signature nhận được từ bước 1
   * Returns: { public_id, secure_url, resource_type, ... }
   */
  async uploadToCloudinary(file, signatureData) {
    const { signature, timestamp, folder, apiKey, cloudName } = signatureData

    const form = new FormData()
    form.append('file', file)
    form.append('signature', signature)
    form.append('timestamp', timestamp)
    form.append('folder', folder)
    form.append('api_key', apiKey)

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    const res = await fetch(cloudinaryUrl, { method: 'POST', body: form })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'Upload Cloudinary thất bại')
    }
    return res.json()
    // Returns: { public_id, secure_url, width, height, format, resource_type, ... }
  },

  /**
   * Bước 3: Báo backend lưu vào DB
   * POST /api/medias/confirm
   * Body: { publicId, resourceType }
   * Returns: { postId, status, ... }
   */
  async confirmUpload(publicId, resourceType = 'image') {
    const { data } = await api.post('/medias/confirm', { publicId, resourceType })
    return data.data
  }
}
