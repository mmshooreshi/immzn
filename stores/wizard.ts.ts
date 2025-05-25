/* ─── stores/wizard.ts ───────────────────────────────────────────────── */
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useWizardStore = defineStore('wizard', () => {
  const step    = useStorage('wizard.step', 1)               // 1 → 3
  const profile = useStorage('wizard.profile', { name:'', email:'' })
  const cvFile  = ref<File|null>(null)                       // not persisted
  const paid    = ref(false)

  const next = () => (step.value = Math.min(step.value + 1, 3))
  const prev = () => (step.value = Math.max(step.value - 1, 1))

  return { step, profile, cvFile, paid, next, prev }
},{
  /* keep only step & profile across reloads */
  persist: { pick: ['step', 'profile'] }
})
