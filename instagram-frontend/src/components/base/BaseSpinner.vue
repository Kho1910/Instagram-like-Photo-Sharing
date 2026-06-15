<template>
  <div class="spinner-wrap">
    <div class="spinner" :style="{ width: size+'px', height: size+'px' }"></div>
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>
<script setup>
defineProps({ size: { type: Number, default: 28 }, label: String })
</script>
<style scoped>
.spinner-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px; }
.spinner {
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin .7s linear infinite;
}
.spinner-label { font-size: 13px; color: var(--color-text-muted); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
