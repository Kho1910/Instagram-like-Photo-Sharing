import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const store = useAuthStore()
  const { user, isLoggedIn, userId, username } = storeToRefs(store)
  function patchUser(patch) {
    return store.patchUser(patch)
  }

  return { user, isLoggedIn, userId, username,
           login: store.login, register: store.register, logout: store.logout,
           patchUser }
}
