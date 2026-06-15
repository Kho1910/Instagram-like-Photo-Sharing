<template>
  <div class="page-wrap">
    <div class="notif-header">
      <h2>🔔 Thông báo</h2>
      <button v-if="unreadCount > 0" @click="markAllRead" class="mark-btn">
        Đánh dấu tất cả đã đọc
      </button>
    </div>

    <BaseSpinner v-if="loading" label="Đang tải..." />

    <div v-else-if="notifications.length === 0" class="empty-state">
      Chưa có thông báo nào.
    </div>

    <div v-else class="notif-list card">
      <div v-for="n in notifications" :key="n.id"
           :class="['notif-item', { 'notif-item--unread': !n.read }]">
        <UserAvatar :username="n.from_username" :size="36" />
        <div class="notif-body">
          <p><strong>{{ n.from_username }}</strong> {{ n.message }}</p>
          <span class="notif-time">{{ formatDate(n.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted }  from 'vue'
import { useNotification } from '@/composables/useNotification'
import { formatDate }      from '@/utils/formatters'
import UserAvatar          from '@/components/user/UserAvatar.vue'
import BaseSpinner         from '@/components/base/BaseSpinner.vue'

const { notifications, unreadCount, fetchAll, markAllRead } = useNotification()
const loading = ref(true)
onMounted(async () => { await fetchAll(); loading.value = false })
</script>

<style scoped>
.notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.notif-header h2 { font-size: 20px; font-weight: 700; }
.mark-btn { font-size: 13px; color: var(--color-primary); border: none; background: none; font-weight: 600; }
.notif-list  { }
.notif-item  { display: flex; gap: 12px; align-items: flex-start;
  padding: 14px 16px; border-bottom: 1px solid var(--color-border); }
.notif-item:last-child { border-bottom: none; }
.notif-item--unread { background: #f5f0ff; }
.notif-body  { flex: 1; }
.notif-body p { font-size: 13px; }
.notif-time  { font-size: 11px; color: var(--color-text-muted); }
</style>
