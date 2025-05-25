<script setup lang="ts">
defineProps<{
  onClick: () => void
}>()
</script>

<template>
  <button @click="onClick" class="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-full border text-sm font-medium
           bg-white text-gray-900 border-gray-300
           hover:bg-gray-100
           dark:bg-neutral-900 dark:text-white dark:border-gray-700 dark:hover:bg-neutral-800">
    <Icon name="devicon:google" class="w-5 h-5" />
    <span>Sign in with Google</span>
  </button>
</template>
