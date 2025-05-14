<script setup lang="ts">
// Global meta data
import { useSettings } from '~/composables/useSettings'
const { language, nextLanguage, theme, toggleTheme } = useSettings()

useHead({ htmlAttrs: { dir: computed(() => language.value === 'fa' ? 'rtl' : 'ltr') } })


</script>

<template>
  <Html lang="en">
  <TransitionOverlay />
  <NuxtPage />

  </Html>
</template>
