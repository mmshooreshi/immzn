// middleware/auth.global.ts  – small, synchronous, zero fetches

import { useAuth } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  if (to.meta.requiresAuth && !auth.user)
    return navigateTo('/login')
})
