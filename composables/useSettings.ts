// composables/useSettings.ts
// import { computed } from 'vue';
import { useSettingsStore } from '~/stores/settings';

export function useSettings() {
  const store = useSettingsStore();

  return {
    locale: computed(() => store.locale),
    language: computed(() => store.language),
    theme: computed(() => store.theme),
    setLocale: store.setLocale,
    nextLanguage: store.nextLanguage,
    toggleTheme: store.toggleTheme,
  };
}
