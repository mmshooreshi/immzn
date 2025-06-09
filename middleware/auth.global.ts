// middleware/auth.global.ts  – small, synchronous, zero fetches

import { useAuth } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  if (to.meta.requiresAuth && !auth.user) {
    await auth.fetch()
    return navigateTo('/login')
  }
})
