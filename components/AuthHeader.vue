<!-- components/AuthHeader.vue -->
<template>
    <div class="flex flex-col items-start rtl gap-9 text-center">
      <div class="flex p-5 self-center items-center justify-center rounded-full bg-[#E4F0DC]">
        <template v-if="isCustomIcon">
          <img
            :src="customIconSrc"
            class="h-12 w-12"
            alt=""
          />
        </template>
        <template v-else>
          <Icon
            :name="icon"
            class="h-12 w-12 text-[#3A7C2B]"
          />
        </template>
      </div>
      <div class="flex flex-col items-start text-right space-y-2 rtl">
        <h1 class="text-2xl font-extrabold leading-tight">{{ title }}</h1>
        <div class="text-xs leading-5 text-[#797B7D]">
          <slot name="subtitle">{{ subtitle }}</slot>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useAuthIcon } from '@/composables/useAuthIcons'
  
  const props = defineProps<{ icon: string; title: string; subtitle?: string }>()
  const { isCustom, src } = useAuthIcon(props.icon)
  
  const isCustomIcon = computed(() => isCustom)
  const customIconSrc = computed(() => src)
  </script>
  