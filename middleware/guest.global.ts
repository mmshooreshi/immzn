// middleware/guest.global.ts

import { useAuth } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.meta.guestOnly) return     // nothing to do

  const auth = useAuth()
  if (auth.user) {
    // already signed in → send them home
    return navigateTo('/profile')
  }
})
