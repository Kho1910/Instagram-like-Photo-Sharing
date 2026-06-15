<template>
  <BaseBadge :tier="tier" :status="status" />
</template>
<script setup>
import BaseBadge from '@/components/base/BaseBadge.vue'
defineProps({ tier: String, status: String })
</script>
