<!-- instagram-frontend/src/components/upload/StatusPoller.vue -->
<!-- Đã cập nhật: không còn poll vì Cloudinary trả kết quả ngay -->
<template>
  <div class="poller">
    <div class="poller__spinner"></div>

    <p class="poller__msg">
      {{ uploading ? '📤 Đang upload lên Cloudinary...' : '✅ Đang lưu vào hệ thống...' }}
    </p>

    <p v-if="uploading && imageInfo" class="poller__tier">
      Ảnh {{ imageInfo.width }}×{{ imageInfo.height }}px
      → Tier dự đoán: <strong>{{ imageInfo.tier }}</strong>
    </p>

    <ProgressBar :value="progress" />

    <p class="poller__step">
      Bước {{ uploading ? '2/3' : '3/3' }}:
      {{ uploading ? 'Upload Cloudinary' : 'Xác nhận với server' }}
    </p>
  </div>
</template>

<script setup>
import ProgressBar from './ProgressBar.vue'
defineProps({
  uploading:  Boolean,
  processing: Boolean,
  progress:   Number,
  imageInfo:  Object
})
</script>

<style scoped>
.poller { text-align: center; padding: 32px 16px; }
.poller__spinner {
  width: 40px; height: 40px; border-radius: 50%;
  border: 3px solid #e2e8f0; border-top-color: #7c3aed;
  animation: spin .7s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.poller__msg  { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.poller__tier { font-size: 12px; color: #718096; margin-bottom: 4px; }
.poller__step { font-size: 11px; color: #718096; margin-top: 8px; }
</style>
