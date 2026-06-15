<template>
  <button :class="['follow-btn', { 'follow-btn--following': modelValue, 'follow-btn--sm': size==='sm' }]"
          @click="toggle" :disabled="loading">
    {{ modelValue ? 'Đang follow' : '+ Follow' }}
  </button>
</template>
<script setup>
import { ref } from 'vue'
import { userService } from '@/services/userService'
const props = defineProps({ userId: Number, isFollowing: Boolean, size: String })
const emit  = defineEmits(['update:isFollowing'])
const loading     = ref(false)
const modelValue  = ref(props.isFollowing)

async function toggle() {
  loading.value = true
  try {
    if (modelValue.value) { await userService.unfollow(props.userId); modelValue.value = false }
    else                  { await userService.follow(props.userId);   modelValue.value = true  }
    emit('update:isFollowing', modelValue.value)
  } finally { loading.value = false }
}
</script>
<style scoped>
.follow-btn { padding: 6px 14px; border-radius: var(--radius-full); font-size: 13px;
  font-weight: 600; border: 1.5px solid var(--color-primary); color: var(--color-primary);
  background: transparent; transition: all .15s; }
.follow-btn:hover { background: var(--color-primary); color: #fff; }
.follow-btn--following { background: var(--color-border); border-color: var(--color-border);
  color: var(--color-text-muted); }
.follow-btn--sm { padding: 4px 10px; font-size: 12px; }
.follow-btn:disabled { opacity: .5; }
</style>
