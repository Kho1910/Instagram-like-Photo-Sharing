<template>
  <nav class="sidenav" :class="{ collapsed: isCollapsed }" @mouseenter="isCollapsed = false" @mouseleave="isCollapsed = true">
    <!-- Logo -->
    <router-link to="/feed" class="sidenav__logo" :title="isCollapsed ? 'InstaClone' : ''">
      <span class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3.5" y="6.5" width="17" height="12" rx="2" />
          <path d="M8 6.5L9.5 4.5H14.5L16 6.5" />
          <circle cx="12" cy="12.5" r="2.5" />
        </svg>
      </span>
      <span v-if="!isCollapsed" class="logo-text">InstaClone</span>
    </router-link>

    <!-- Menu Items -->
    <div class="sidenav__menu">
      <nav-item icon="home" label="Feed" to="/feed" :collapsed="isCollapsed" />
      <nav-item icon="upload" label="Upload" to="/upload" :collapsed="isCollapsed" />
      <nav-item icon="profile" label="Profile" :to="'/users/' + userId" :collapsed="isCollapsed" />
    </div>

    <!-- Bottom Actions -->
    <div class="sidenav__bottom">
      <button class="sidenav__logout" title="Logout" @click="handleLogout">
        <span class="logout-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </span>
        <span v-if="!isCollapsed" class="logout-text">Đăng xuất</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NavItem from './NavItem.vue'

const router = useRouter()
const { userId, logout } = useAuth()
const isCollapsed = ref(true)

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.sidenav {
  width: var(--nav-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px 8px;
  z-index: 100;
}

.sidenav.collapsed {
  width: var(--nav-width-sm);
}

.sidenav__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 32px;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
}

.sidenav__logo:hover {
  background: var(--color-surface-hover);
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.logo-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  white-space: nowrap;
}

.sidenav__menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidenav__bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.sidenav__logout {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  text-align: left;
}

.sidenav__logout:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
}

.logout-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon svg {
  width: 20px;
  height: 20px;
}

.logout-text {
  white-space: nowrap;
}

.sidenav.collapsed .logo-text,
.sidenav.collapsed .logout-text {
  display: none;
}

@media (max-width: 768px) {
  .sidenav {
    width: var(--nav-width);
  }

  .sidenav.collapsed {
    width: var(--nav-width);
  }

  .sidenav__logo {
    padding: 12px 16px;
  }

  .sidenav.collapsed .nav-item {
    justify-content: flex-start;
    padding: 12px 16px;
  }
}
</style>
