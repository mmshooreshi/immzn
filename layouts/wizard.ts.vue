<!-- ─── layouts/wizard.vue ──────────────────────────────────────────── -->
<template>
  <div class="min-h-screen flex flex-col items-center py-8">
    <nav class="flex gap-4 mb-8">
      <span v-for="i in 3" :key="i" :class="i === step ? 'font-600 text-blue-600' : 'text-gray-400'">
        Step {{ i }}
      </span>
    </nav>
    <slot />
  </div>
</template>

<script setup>
import { useWizardStore } from '~/stores/wizard'
const { step } = useWizardStore()
</script>
