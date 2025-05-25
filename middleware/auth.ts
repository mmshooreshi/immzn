export default defineNuxtRouteMiddleware((to, from) => {
  if (!useCookie('session').value) return navigateTo('/login')
})
