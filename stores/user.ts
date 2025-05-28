// stores/user.ts
import { defineStore } from 'pinia'
import type { UserProfile } from '~/types'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    ready  : false
  }),

  getters: {
    phone: s => s.profile?.phone ?? ''
  },

  actions: {
    async hydrate() {
      if (this.ready) return
      useNuxtApp().$log.info('hydrate → /api/user/me')

      const { data, error } = await useFetch('/api/user/me', {
        server: false,
        credentials: 'include',
        headers: useRequestHeaders(['cookie']),
        watch: false
      })

      
      if (!error.value) {
        this.profile = data.value
        useNuxtApp().$log.success('user hydrated', data)
      } else {
        useNuxtApp().$log.warn('hydrate failed', error.value)
      }
      this.ready = true
    },

    async logout () {
      const api = useApi()
      await api('/api/auth/logout', { method: 'POST' })

      await api('/api/auth/logout', { method: 'POST' })
      this.$reset()
      useRouter().push('/login')
    }
  },

  persist: true // ← enable persistence (defaults to localStorage)
})
