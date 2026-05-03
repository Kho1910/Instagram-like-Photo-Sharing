<template>
  <div class="image-grid">
    <slot />
  </div>
</template>

<style scoped>
.image-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
</style>
