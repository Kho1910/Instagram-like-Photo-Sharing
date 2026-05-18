<template>
  <div class="comment-input">
    <input ref="input" v-model="text" placeholder="Thêm bình luận..." @keyup.enter="submit"
           class="comment-field" maxlength="500" />
    <button @click="submit" :disabled="!text.trim()" class="comment-submit">Đăng</button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const emit = defineEmits(['submit'])
const input = ref(null)
const text = ref('')
function submit() {
  if (!text.value.trim()) return
  emit('submit', text.value.trim())
  text.value = ''
}

defineExpose({ focus: () => input.value?.focus() })
</script>
<style scoped>
.comment-input { display: flex; gap: 8px; border-top: 1px solid var(--color-border); padding-top: 10px; margin-top: 8px; }
.comment-field { flex: 1; border: none; outline: none; font-size: 13px; background: transparent; }
.comment-submit { border: none; background: none; color: var(--color-primary);
  font-weight: 700; font-size: 13px; }
.comment-submit:disabled { opacity: .4; }
</style>
