// composables/useClockIcon.js
import { computed } from 'vue'

export function useClockIcon(session) {
  const hour = computed(() => {
    const h = parseInt(session.time.start.split(':')[0], 10)
    return h % 12 || 12 // convert to 12-hour format
  })

  const iconName = computed(() => `wi:time-${hour.value}`)

  return {
    hour,
    iconName
  }
}
