<template>
  <div class="preview">
    <img :src="src" class="preview__img" />
    <div v-if="info" class="preview__meta">
      <span>{{ info.name }}</span>
      <span>{{ info.width }}×{{ info.height }}px</span>
      <span>{{ (info.size / 1024 / 1024).toFixed(2) }} MB</span>
      <strong>→ Tier dự đoán: {{ info.tier }}</strong>
    </div>
  </div>
</template>
<script setup>
defineProps({ src: String, info: Object })
</script>
<style scoped>
.preview { width: 100%; text-align: center; }
.preview__img { max-height: 280px; object-fit: contain; border-radius: var(--radius-md); margin: 0 auto; }
.preview__meta { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
  font-size: 12px; color: var(--color-text-muted); margin-top: 10px; }
</style>
