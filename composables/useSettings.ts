/* ~/composables/useSettings.ts */
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'

export function useSettings() {
  const store = useSettingsStore()
  const { language, theme } = storeToRefs(store)

  return {
    language,                       // refs – not plain values
    theme,
    nextLanguage: store.nextLanguage,
    setLanguage: store.setLanguage,
    toggleTheme:  store.toggleTheme,
  }
}
