/* ~/stores/dataStore.ts */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettings } from '~/composables/useSettings'

/** Utility: recursively split each `{ en, fa }` leaf into two trees. */
function splitByLang<T>(obj: T): { en: T; fa: T } {
  // console.log('splitByLang called with:', obj)

  if (obj === null || typeof obj !== 'object') {
    // console.log('splitByLang returning primitive:', obj)
    return { en: obj, fa: obj } as any
  }

  if (Array.isArray(obj)) {
    const enArr: any[] = []
    const faArr: any[] = []
    for (const el of obj) {
      const split = splitByLang(el)
      enArr.push(split.en)
      faArr.push(split.fa)
    }
    // console.log('splitByLang returning arrays:', { en: enArr, fa: faArr })
    return { en: enArr as any, fa: faArr as any }
  }

  const hasLangKeys = 'en' in (obj as any) || 'fa' in (obj as any)
  if (hasLangKeys) {
    const { en = null, fa = null } = obj as any
    // console.log('splitByLang found language keys:', { en, fa })
    return { en, fa }
  }

  const enObj: Record<string, any> = {}
  const faObj: Record<string, any> = {}

  for (const key in obj as Record<string, any>) {
    const split = splitByLang((obj as any)[key])
    if (split.en !== null) enObj[key] = split.en
    if (split.fa !== null) faObj[key] = split.fa
  }
  // console.log('splitByLang returning objects:', { en: enObj, fa: faObj })
  return { en: enObj, fa: faObj } as any
}

export const useDataStore = defineStore('dataStore', () => {
  /* ───────────────────────── state ───────────────────────── */
  const rawData  = ref<Record<string, any> | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  /* ───────────────────────── getters ─────────────────────── */
  const { language } = useSettings()

  const splitData = computed(() => {
    // console.log('Computing splitData...')
    const result = rawData.value ? splitByLang(rawData.value) : { en: {}, fa: {} }
    // console.log('splitData computed:', result)
    return result
  })

  const localizedData = computed(() => {
    const lang = language.value === 'fa' ? 'fa' : 'en'
    // console.log('Computing localizedData for language:', lang)
    const data = (splitData.value as any)[lang]
    // console.log('localizedData computed:', data)
    return data
  })

  const isLoaded = computed(() => {
    const loaded = !!rawData.value
    // console.log('isLoaded computed:', loaded)
    return loaded
  })

  /* ───────────────────────── actions ─────────────────────── */
  async function loadData() {
    if (isLoaded.value || loading.value) {
      // console.log('loadData: already loaded or loading, skipping')
      return
    }
    // console.log('loadData: start loading')
    loading.value = true
    error.value = null

    try {
      // Nuxt’s $fetch works both server-side and client-side
      rawData.value = await $fetch<Record<string, any>>('/api/data/all')
      // console.log('loadData: data fetched successfully', rawData.value)
    } catch (e) {
      error.value = (e as Error).message
      console.error('loadData: error occurred:', error.value)
    } finally {
      loading.value = false
      // console.log('loadData: loading finished')
    }
  }

  /* ───────────────────────── exposed API ─────────────────── */
  return {
    /* state */
    rawData,
    loading,
    error,

    /* getters */
    localizedData,
    isLoaded,

    /* actions */
    loadData,
  }
})
