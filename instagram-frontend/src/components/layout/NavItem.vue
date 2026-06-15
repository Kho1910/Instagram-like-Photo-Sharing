<template>
  <router-link
    :to="to"
    class="nav-item"
    :class="{ active: isActive, collapsed }"
    :title="collapsed ? label : ''"
  >
    <span class="nav-icon" v-html="iconSvg"></span>
    <span v-if="!collapsed" class="nav-label">{{ label }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  icon: String,
  label: String,
  to: String,
  collapsed: Boolean
})

const route = useRoute()
const isActive = computed(() => {
  return route.path.startsWith(props.to)
})

const iconSvg = computed(() => {
  const icons = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1v-8.5z"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12"/><path d="M8 8l4-4 4 4"/><path d="M5 20h14"/></svg>`,
    profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>`
  }
  return icons[props.icon] || ''
})
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.nav-item.active {
  color: var(--color-primary);
  background: var(--color-surface-hover);
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 0 3px 3px 0;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.nav-label {
  white-space: nowrap;
}

/* Tooltip for collapsed state */
.nav-item.collapsed {
  padding: 12px 8px;
  justify-content: center;
}
</style>
