import { ref } from 'vue'
import api from '@/api/axios'
import axios from 'axios'

export function useUpload() {
  const isUploading = ref(false)

  const uploadImage = async (file, caption) => {
    isUploading.value = true
    try {
      const { data: signResponse } = await api.post('/medias/upload-signature')
      const signData = signResponse.data || signResponse

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp)
      formData.append('signature', signData.signature)
      formData.append('folder', signData.folder)
      formData.append('resource_type', 'image')

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        formData
      )

      const publicId = cloudinaryRes.data.public_id
      const { data: confirmResponse } = await api.post('/medias/confirm', {
        publicId,
        resourceType: 'image'
      })
      const mediaId = confirmResponse.data?.mediaId || confirmResponse.mediaId

      if (!mediaId) {
        throw new Error('Không lấy được ID media')
      }

      await api.post('/posts', {
        title: null,
        content: caption,
        mediaIds: [mediaId]
      })
      return true
    } catch (error) {
      console.error('Upload failed:', error)
      return false
    } finally {
      isUploading.value = false
    }
  }

  return { uploadImage, isUploading }
}
