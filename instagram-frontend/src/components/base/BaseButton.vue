<template>
  <button
    :class="['btn', `btn--${variant}`, { 'btn--loading': loading, 'btn--block': block }]"
    :disabled="loading || disabled"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn__spinner"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant:  { type: String, default: 'primary' }, // primary | secondary | danger | ghost
  loading:  { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block:    { type: Boolean, default: false },
})
</script>

<style scoped>
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 8px 16px; border-radius: var(--radius-full);
  font-size: 13px; font-weight: 600; border: none; transition: all .15s;
}
.btn--block { width: 100%; }
.btn--primary  { background: var(--color-primary); color: #fff; }
.btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn--secondary { background: transparent; border: 1.5px solid var(--color-primary); color: var(--color-primary); }
.btn--danger   { background: var(--color-danger); color: #fff; }
.btn--ghost    { background: transparent; color: var(--color-text-muted); }
.btn--ghost:hover { background: var(--color-border); }
.btn:disabled  { opacity: .55; cursor: not-allowed; }
.btn__spinner  {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
