<template>
  <div class="input-wrap">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      class="input-field"
      :class="{ 'input-field--error': error }"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    />
    <p v-if="error" class="input-error">{{ error }}</p>
  </div>
</template>
<script setup>
defineProps({ modelValue: String, label: String, error: String })
defineEmits(['update:modelValue'])
</script>
<style scoped>
.input-wrap { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.input-label { font-size: 13px; font-weight: 500; color: var(--color-text); }
.input-field {
  padding: 10px 12px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 14px; transition: border-color .15s;
  background: var(--color-surface);
  color: var(--color-text);
}
.input-field::placeholder {
  color: var(--color-text-muted);
}
.input-field:focus { outline: none; border-color: var(--color-primary); }
.input-field--error { border-color: var(--color-danger); }
.input-error { font-size: 12px; color: var(--color-danger); }
</style>
