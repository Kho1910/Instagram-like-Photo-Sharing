<!-- Wrapper component for the sentinel + loading state -->
<template>
  <div>
    <slot />
    <div ref="sentinelEl" class="sentinel">
      <BaseSpinner v-if="loading" :size="24" />
      <p v-else-if="!hasMore" class="end-msg">Đã xem hết ✓</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
const props = defineProps({ loading: Boolean, hasMore: Boolean })
const emit  = defineEmits(['load-more'])
const sentinelEl = ref(null)
let observer = null
onMounted(() => {
  observer = new IntersectionObserver(
    entries => { if (entries[0].isIntersecting && !props.loading) emit('load-more') },
    { rootMargin: '200px' }
  )
  setTimeout(() => { if (sentinelEl.value) observer.observe(sentinelEl.value) }, 100)
})
onUnmounted(() => observer?.disconnect())
</script>
<style scoped>
.sentinel { padding: 24px; display: flex; justify-content: center; }
.end-msg  { font-size: 13px; color: var(--color-text-muted); }
</style>
