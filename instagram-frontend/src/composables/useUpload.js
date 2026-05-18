// frontend/src/composables/useUpload.js
// Flow đúng với backend:
// 1. getSignature   → POST /api/medias/upload-signature
// 2. uploadCloudinary → POST cloudinary trực tiếp
// 3. confirmMedia   → POST /api/medias/confirm  (nhận mediaId)
// 4. createPost     → POST /api/posts { mediaIds: [mediaId] }
import { ref } from 'vue'
import { mediaService } from '@/services/mediaService'
import { postService }  from '@/services/postService'
import { readImageInfo } from '@/utils/helpers'

export function useUpload() {
  const files        = ref([])
  const previews     = ref([])
  const imageInfos   = ref([])
  const uploading    = ref(false)
  const processing   = ref(false)
  const progress     = ref(0)
  const result       = ref(null)
  const error        = ref('')

  async function handleFiles(fileList) {
    const newFiles = Array.isArray(fileList) ? fileList : Array.from(fileList || [])
    for (const file of newFiles) {
      if (!file?.type?.startsWith('image/')) continue
      const info = await readImageInfo(file)
      files.value.push(file)
      previews.value.push(info.url)
      imageInfos.value.push(info)
    }
  }

  async function upload(fileOrFiles, { title = '', content = '' } = {}) {
    error.value     = ''
    uploading.value = true
    progress.value  = 10

    try {
      const uploadFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
      const mediaIds = []
      let currentStep = 0
      const totalSteps = uploadFiles.length * 2 + 2

      for (const file of uploadFiles) {
        const signatureData = await mediaService.getSignature()
        currentStep += 1
        progress.value = Math.min(100, Math.round(10 + (70 * currentStep) / totalSteps))

        const cloudResult = await mediaService.uploadToCloudinary(file, signatureData)
        currentStep += 1
        progress.value = Math.min(100, Math.round(10 + (70 * currentStep) / totalSteps))

        const confirmedMedia = await mediaService.confirmUpload(
          cloudResult.public_id,
          cloudResult.resource_type
        )
        mediaIds.push(confirmedMedia.mediaId)
      }

      progress.value    = 85
      processing.value  = true
      uploading.value   = false

      const post = await postService.createPost(mediaIds, title, content)
      progress.value   = 100
      processing.value = false

      result.value = {
        ...post,
        resized_url:    previews.value[0] || null,
        original_url:   previews.value[0] || null,
        mediaIds,
      }

      return result.value
    } catch (e) {
      error.value      = e.message || 'Upload thất bại, thử lại.'
      uploading.value  = false
      processing.value = false
      progress.value   = 0
    }
  }

  function removeFile(index) {
    if (!previews.value[index]) return
    URL.revokeObjectURL(previews.value[index])
    previews.value.splice(index, 1)
    imageInfos.value.splice(index, 1)
    files.value.splice(index, 1)
  }

  function reset() {
    previews.value.forEach(url => URL.revokeObjectURL(url))
    files.value       = []
    previews.value    = []
    imageInfos.value  = []
    uploading.value   = false
    processing.value  = false
    progress.value    = 0
    result.value      = null
    error.value       = ''
  }

  return {
    files,
    previews,
    imageInfos,
    uploading,
    processing,
    progress,
    result,
    error,
    handleFiles,
    upload,
    removeFile,
    reset
  }
}
