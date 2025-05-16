// plugins/data-init.ts
import { callOnce } from '#app'
import { useDataStore } from '~/stores/dataStore'

/**
 * Loads all JSON content exactly once (server-side on first render,
 * reused on the client after hydration).
 */
export default defineNuxtPlugin(async () => {
  const store = useDataStore()

  // callOnce writes the result into Nuxt payload → no second request on hydrate
  await callOnce('init-data', () => store.loadData())
})


