/* ~/stores/settings.ts */
import { defineStore }  from 'pinia'
import { useCookie }    from '#app'

export type Lang  = 'en' | 'fa'
export type Theme = 'light' | 'dark'


export const useSettingsStore = defineStore('settings', () => {
  const langCookie = useCookie<Lang>('lang', { path: '/', sameSite: 'lax' })
  const language   = ref<Lang>(langCookie.value ?? 'en')
  function setLanguage (lang: Lang) { 
    language.value = lang
    langCookie.value = language.value
   }
  function nextLanguage () { setLanguage(language.value === 'en' ? 'fa' : 'en') }

  /* ---------- theme in localStorage (client only) ------ */
  const theme = ref<Theme>('light')
  const toggleTheme = () =>
    (theme.value = theme.value === 'light' ? 'dark' : 'light')

  return { language, theme, setLanguage, nextLanguage, toggleTheme }
}, {
  /* Pinia persistence config */
  persist: {
    key: 'settings',          // <localStorage key>
    storage: piniaPluginPersistedstate.localStorage(),    // <-- NOT a function, just the object
    pick: ['theme'],         // only keep this field
  },
})
