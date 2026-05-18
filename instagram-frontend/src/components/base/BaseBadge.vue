<template>
  <span class="badge" :style="{ background: bg, color: tc }">{{ label }}</span>
</template>
<script setup>
import { computed } from 'vue'
import { RESOLUTION_TIERS } from '@/utils/constants'
const props = defineProps({ tier: String, status: String })
const cfg   = computed(() => RESOLUTION_TIERS[props.tier] || RESOLUTION_TIERS.original)
const bg    = computed(() => cfg.value.bg)
const tc    = computed(() => cfg.value.color)
const label = computed(() => `${cfg.value.label}${props.status ? ' • ' + props.status : ''}`)
</script>
<style scoped>
.badge { font-size: 11px; font-weight: 600; padding: 3px 10px;
  border-radius: var(--radius-full); display: inline-block; }
</style>
