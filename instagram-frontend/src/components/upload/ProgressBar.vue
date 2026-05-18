<template>
  <div class="progress-wrap">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: value + '%' }"></div>
    </div>
    <span class="progress-label">{{ value }}%</span>
  </div>
</template>
<script setup>
defineProps({ value: { type: Number, default: 0 } })
</script>
<style scoped>
.progress-wrap  { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.progress-track { flex: 1; height: 6px; background: var(--color-border); border-radius: var(--radius-full); overflow: hidden; }
.progress-fill  { height: 100%; background: var(--color-primary); border-radius: var(--radius-full); transition: width .4s ease; }
.progress-label { font-size: 12px; color: var(--color-text-muted); width: 34px; text-align: right; }
</style>
