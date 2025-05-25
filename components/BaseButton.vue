<!-- components/BaseButton.vue -->
<template>
    <button
      class="relative w-full rounded-2xl px-6 py-3 text-base font-semibold transition-all duration-200
           bg-[#E4F0DC]/100 text-[#3A7C2B] hover:scale-102 hover:bg-primary-600 active:scale-98 focus:scale-98
             disabled:scale-100 disabled:text-black disabled:bg-[#EBEBEB]/100 disabled:cursor-not-allowed disabled:opacity-60"
      v-bind="$attrs"
      :disabled="loading || $attrs.disabled"
    >
    <span v-if="loading" class="flex justify-center">
      <!-- Minimal spinner: a single circle rotating -->
      <svg class="w-5 h-5 animate-spin" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-dasharray="31.4 31.4"
          stroke-linecap="round"
        />
      </svg>
    </span>
      <span v-else><slot/></span>
    </button>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    loading?: boolean
  }>()
  </script>
  