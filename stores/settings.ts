// stores/settings.ts
import { defineStore } from 'pinia';

export type Locale = 'en' | 'fa';
export type Theme = 'light' | 'dark';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    locale: 'en' as Locale,
    language: 'en' as Locale,
    theme: 'light' as Theme,
  }),

  actions: {
    setLocale(lang: Locale) {
      this.locale = lang;
    },
    nextLanguage() {
      const langs: Locale[] = ['en', 'fa'];
      const i = langs.indexOf(this.language);
      this.language = langs[(i + 1) % langs.length];
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage(), // or just `true`
    pick: ['locale', 'language', 'theme'],
  },
});
