<script setup lang="ts">
// Global meta data
import { useSettings } from '~/composables/useSettings'
const { language, nextLanguage, theme, toggleTheme } = useSettings()

// useHead({ htmlAttrs: { dir: computed(() => language.value === 'fa' ? 'rtl' : 'ltr') } })
// useHead({
//   htmlAttrs: {
//     'data-lang': computed(() => language.value === 'fa' ? 'en' : 'fa')
//   }
// });


// watchEffect(() => {
//   useHead({ htmlAttrs: { 'data-lang': language.value === 'fa' ? 'fa' : 'en' } })
// })

useHead(() => ({
  htmlAttrs: { 'data-lang': language.value === 'fa' ? 'fa' : 'en' }
}))


</script>

<template>
  <Html lang="en">
  <!-- <TransitionOverlay /> -->
  <NuxtPage />

  </Html>
</template>
