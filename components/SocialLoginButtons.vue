<!-- components/SocialLoginButtons.vue -->
<template>
    <div class="flex flex-row-reverse items-center justify-between gap-2">
      <button
        v-for="(provider, i) in providers"
        :key="i"
        class="flex w-full items-center justify-center rounded-2xl bg-transparent border border-[#CCCCCC] hover:bg-[#CCCCCC]/30 px-6 py-3 transition hover:opacity-80 hover:scale-105"
        @click="$emit('social', provider.key)"
      >
        <NuxtImg :src="provider.icon" :alt="provider.alt" class="h-6 w-6 object-contain" loading="lazy" />
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  interface Provider {
    key: string
    icon: string
    alt: string
  }
  
  interface Props {
    providers?: Provider[]
  }
  
  defineProps<Props>()
  </script>
  