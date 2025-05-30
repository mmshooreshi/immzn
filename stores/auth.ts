// stores/auth.ts
import { defineStore } from 'pinia'
import type { Prisma } from '@prisma/client'

export type Role       = Prisma.Role
export type Attendance = Prisma.Attendance

export interface AuthUser {
  id: number
  phone: string
  email: string
  fullName: string
  affiliation: string | null
  role: Role
  field: string
  attendance: Attendance
  tracks: string[]
  cvUrl: string | null
  wantsNewsletter: boolean
}

export const useAuth = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null
  }),

  actions: {
    set(u: AuthUser) {
      this.user = u
    },

    async fetch() {
      try {
        const me = await $fetch<AuthUser>('/api/user/me')
        this.user = me
      } catch {
        this.user = null
      }
    },

    async updateProfile(payload: {
      fullName?: string
      affiliation?: string
      role?: Role
      attendance?: Attendance
      tracks?: string[]
      wantsNewsletter?: boolean
    }) {
      if (!this.user) throw new Error('Not authenticated')
      const updated = await $fetch<AuthUser>('/api/user/update', {
        method: 'POST',
        body: payload
      })
      this.user = updated
    },

    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
    }
  },

  persist: true
})
