<!-- frontend/src/views/UploadView.vue -->
<template>
  <div class="page-wrap">
    <h2 class="page-heading">📤 Upload ảnh</h2>

    <div class="upload-wrap card">

      <!-- Bước 1: Chọn file + điền caption -->
      <template v-if="!uploading && !processing && !result">
        <DropZone
          ref="dropzoneRef"
          @file-selected="onFileSelected"
        />

        <div v-if="previews.length" class="preview-grid">
          <div
            v-for="(src, index) in previews"
            :key="index"
            class="preview-thumb"
          >
            <img :src="src" alt="Preview" />
            <button class="remove-file" type="button" @click="removeFile(index)">×</button>
          </div>
          <button type="button" class="preview-add" @click="openFilePicker">
            + Thêm ảnh
          </button>
        </div>

        <div v-if="previews.length" class="caption-form">
          <input
            v-model="title"
            class="caption-input"
            placeholder="Tiêu đề"
          />
          <textarea
            v-model="content"
            class="caption-textarea"
            placeholder="Mô tả ảnh"
            rows="3"
          />
          <BaseButton block @click="doUpload" :loading="false">
             Upload ngay
          </BaseButton>
        </div>
      </template>

      <!-- Bước 2: Đang xử lý -->
      <StatusPoller
        v-else-if="uploading || processing"
        :uploading="uploading"
        :processing="processing"
        :progress="progress"
        :image-info="imageInfos[0]"
      />

      <!-- Bước 3: Kết quả -->
      <div v-else-if="result" class="result">
        <p class="result-success">✅ Đăng ảnh thành công!</p>
        <img
          :src="result.resized_url"
          class="result-img"
          :alt="result.title"
        />
        <div class="result-meta">
          <span class="tier-badge">
            {{ result.resolution_tier }} ({{ result.width }}×{{ result.height }}px) • done
          </span>
        </div>
        <div v-if="result.title || result.content" class="result-description">
          <p v-if="result.title" class="result-title">{{ result.title }}</p>
          <p v-if="result.content" class="result-content">{{ result.content }}</p>
        </div>
        <div class="result-actions">
          <BaseButton variant="primary" @click="$router.push('/feed')">
            Về Feed
          </BaseButton>
          <BaseButton variant="ghost" @click="reset">
            Upload thêm
          </BaseButton>
        </div>
      </div>

      <p v-if="error" class="upload-error">⚠ {{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUpload }    from '@/composables/useUpload'
import DropZone        from '@/components/upload/DropZone.vue'
import StatusPoller    from '@/components/upload/StatusPoller.vue'
import BaseButton      from '@/components/base/BaseButton.vue'

const {
  files, previews, imageInfos, uploading, processing,
  progress, result, error,
  handleFiles, upload, removeFile, reset
} = useUpload()

const title   = ref('')
const content = ref('')
const dropzoneRef = ref(null)

async function onFileSelected(fileList) {
  await handleFiles(fileList)
}

function openFilePicker() {
  dropzoneRef.value?.openFilePicker()
}

async function doUpload() {
  if (!files.value.length) return
  await upload(files.value, { title: title.value, content: content.value })
}
</script>

<style scoped>
.page-heading  { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.upload-wrap   { padding: 24px; max-width: 600px; margin: 0 auto; }

.caption-form  { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.caption-input {
  padding: 10px 12px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 14px;
}
.caption-textarea {
  padding: 10px 12px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 14px;
  resize: vertical; font-family: inherit;
}
.caption-input:focus, .caption-textarea:focus {
  outline: none; border-color: var(--color-primary);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 18px;
}
.preview-thumb {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  min-height: 120px;
  background: #f8fafc;
}
.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-file {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,.55);
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
.preview-add {
  min-height: 120px;
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: var(--color-primary);
  font-size: 18px;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.result        { text-align: center; }
.result-success { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: var(--color-success); }
.result-img    {
  max-height: 320px; object-fit: contain;
  margin: 0 auto 16px; border-radius: var(--radius-md); display: block;
}
.result-meta   { margin-bottom: 14px; }
.result-title  { font-weight: 700; margin-bottom: 4px; }
.result-content { color: #4a5568; font-size: 14px; margin-bottom: 12px; }
.tier-badge    {
  font-size: 12px; font-weight: 600; padding: 4px 10px;
  border-radius: var(--radius-full); background: #E1F5EE; color: #085041;
}
.result-actions { display: flex; gap: 10px; justify-content: center; }
.upload-error  { color: var(--color-danger); text-align: center; margin-top: 12px; font-size: 13px; }
</style>
