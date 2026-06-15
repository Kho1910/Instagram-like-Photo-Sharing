import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationService } from '@/services/notificationService'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount   = computed(() => notifications.value.filter(n => !n.read).length)

  async function fetchAll() {
    notifications.value = await notificationService.getAll()
  }

  async function markAllRead() {
    await notificationService.markAllRead()
    notifications.value.forEach(n => n.read = true)
  }

  return { notifications, unreadCount, fetchAll, markAllRead }
})
