import { defineStore } from 'pinia'

export const useAuth = defineStore('auth', {
  state: () => ({
    user: null as { id: number; phone: string } | null
  }),

  actions: {
    set (u: { id: number; phone: string }) {
      this.user = u
    },
    async fetch () {
      try   { this.user = await $fetch('/api/me') }
      catch { this.user = null }
    },
    async logout () {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
    }
  },

  persist: true
})
