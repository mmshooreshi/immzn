export const useUser = () => {
  const user = useState<{ id: number; phone: string; created_at: string } | null>('user', () => null)
  const { data, pending, error } = useFetch('/api/profile', { credentials: 'include' })

  watchEffect(() => {
    if (data.value?.user) user.value = data.value.user
  })

  return { user, pending, error }
}
