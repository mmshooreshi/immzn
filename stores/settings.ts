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
  function toggleTheme() {
    if (!process.client) return
    // system‐pref
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    // decide next: if we've toggled before, flip; else pick saved‐or‐os
    const next = theme.value
      ? (theme.value === 'dark' ? 'light' : 'dark')
      : (localStorage.theme ?? (osDark ? 'dark' : 'light'))

    localStorage.theme = next
    document.documentElement.classList.toggle('dark', next === 'dark')
    theme.value = next
  }

  // run once on load to init from saved/OS
  if (import.meta.client) toggleTheme()

      // ✅ new setting: toastShow
  const toastShow = ref(true)
  function toggleToast() {
    toastShow.value = !toastShow.value
  }



  return { language, theme, toastShow, setLanguage, nextLanguage, toggleTheme, toggleToast }
}, {
  /* Pinia persistence config */
  persist: {
    key: 'settings',          // <localStorage key>
    storage: piniaPluginPersistedstate.cookies(), 
    pick: ['theme', 'toastShow'],         // only keep this field
  },
})
