<template>
  <div class="app-layout">
    <AppSideNav v-if="isLoggedIn" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppSideNav from '@/components/layout/AppSideNav.vue'
import { useAuth } from '@/composables/useAuth'
const { isLoggedIn } = useAuth()
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.main-content {
  flex: 1;
  overflow-y: auto;
}
</style>
