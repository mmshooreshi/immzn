/* ~/composables/useSettings.ts */
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'

export function useSettings() {
  const store = useSettingsStore()
  const { language, theme, toastShow } = storeToRefs(store)  // ✅ include toastShow

  return {
    language,
    theme,
    toastShow,                         // ✅ expose
    nextLanguage: store.nextLanguage,
    setLanguage: store.setLanguage,
    toggleToast: store.toggleToast,
    toggleTheme: store.toggleTheme,
  }
}
