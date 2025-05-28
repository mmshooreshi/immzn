export const useCurrentUser = () => {
  const user = useState('user', () => null as any)

  if (import.meta.server) {
    const event = useRequestEvent()
    user.value = event?.context.user ?? null
    $log.debug('SSR user set', user.value?.id)
  }

  if (import.meta.client && user.value === null) {
    onMounted(async () => {
      const { data } = useAsyncData('me', () => $fetch('/api/me').catch(() => null))
      if (data.value) {
        user.value = data.value
        $log.debug('Client user fetched', user.value?.id)
      } else {
        $log.warn('Client could not fetch user')
      }
    })
  }

  return { user }
}
