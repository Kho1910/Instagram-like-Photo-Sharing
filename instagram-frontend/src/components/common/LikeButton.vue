<template>
  <button @click="$emit('toggle', !modelValue)"
          :class="['like-btn', { 'like-btn--liked': modelValue }]">
    {{ modelValue ? '♥' : '♡' }}
    <span>{{ formatCount(count) }}</span>
  </button>
</template>
<script setup>
import { formatCount } from '@/utils/formatters'
defineProps({ modelValue: Boolean, count: { type: Number, default: 0 } })
defineEmits(['toggle'])
</script>
<style scoped>
.like-btn { display: flex; align-items: center; gap: 5px; border: none;
  background: none; font-size: 20px; color: var(--color-text-muted); transition: color .15s; }
.like-btn--liked { color: var(--color-danger); }
.like-btn span { font-size: 13px; font-weight: 600; }
</style>
