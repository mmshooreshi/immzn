import { useAuth } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const auth = useAuth() // This now has full typing
  if (!auth.user) await auth.fetch()
})
