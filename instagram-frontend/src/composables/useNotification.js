import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notificationStore'

export function useNotification() {
  const store = useNotificationStore()
  const { notifications, unreadCount } = storeToRefs(store)
  return { notifications, unreadCount,
           fetchAll: store.fetchAll, markAllRead: store.markAllRead }
}
