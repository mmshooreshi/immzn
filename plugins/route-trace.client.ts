export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.dev) {

  const router = useRouter()

  router.beforeEach((to, from) => {
    const mode = import.meta.server ? 'SSR' : 'Client'
    $log.info(`[${mode}] 🧭 Navigating:`, {
      from: from.fullPath || '/',
      to  : to.fullPath || '/',
      name: to.name || 'unnamed'
    })
  })

  $log.info('🧭 Route tracing plugin initialized')
}
})
