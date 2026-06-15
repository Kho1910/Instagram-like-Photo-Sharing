<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--over': isDragging }"
    @click="openFilePicker"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <input ref="input" type="file" accept="image/*" multiple hidden @change="onSelect" />

    <div v-if="!preview" class="dropzone__hint">
      <span class="dropzone__icon">📤</span>
      <p><strong>Bấm hoặc kéo thả ảnh vào đây</strong></p>
      <p class="dropzone__sub">JPG, PNG, WEBP — tối đa 20MB</p>
    </div>

    <ImagePreview v-else :src="preview" :info="imageInfo" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImagePreview from './ImagePreview.vue'

const emit  = defineEmits(['file-selected'])
const isDragging = ref(false)
const input = ref(null)

function onSelect(e) {
  const files = Array.from(e.target.files || [])
  emit('file-selected', files)
}
function onDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files || [])
  emit('file-selected', files)
}
function openFilePicker() {
  input.value?.click()
}

defineExpose({ openFilePicker })
</script>

<style scoped>
.dropzone {
  border: 2px dashed var(--color-border); border-radius: var(--radius-lg);
  min-height: 260px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color .15s, background .15s;
}
.dropzone--over { border-color: var(--color-primary); background: #f5f0ff; }
.dropzone__hint { text-align: center; color: var(--color-text-muted); }
.dropzone__icon { font-size: 40px; display: block; margin-bottom: 10px; }
.dropzone__sub  { font-size: 12px; margin-top: 6px; }
</style>
