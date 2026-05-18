<template>
  <AppNavbar v-if="isLoggedIn" />
  <router-view />
</template>

<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import { useAuth } from '@/composables/useAuth'
const { isLoggedIn } = useAuth()
</script>
