<!-- components/Localized.vue -->
<script setup lang="ts">
// import { defineAsyncComponent, h } from 'vue'
import { useSettings } from '~/composables/useSettings'

/** Component to render (passed as prop) */
const props = defineProps<{ is: string | Object }>()     // `Object` = SFC

const { language } = useSettings()
</script>

<template>
  <!-- 1️⃣ run only in browser (GSAP needs window) -->
  <ClientOnly>
    <!-- 2️⃣ remount whenever the language changes -->
    <component :is="props.is" :key="language" v-bind="$attrs" />
  </ClientOnly>
</template>
