<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<template>
  <div
    class="flex max-w-lg flex-col-reverse sm:flex-row-reverse justify-between items-start sm:items-center gap-0 sm:gap-4 px-4 py-2 rounded-xl bg-white dark:bg-zinc-700 shadow-sm transition-all"
  >

    <span
      class="text-sm sm:text-base text-nowrap text-gray-800 dark:text-white font-semibold break-words text-right sm:text-left w-full sm:w-auto"
    >
      {{ value }}
    </span>

        <span class="text-xs text-nowrap font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {{ label }}
    </span>

  </div>
</template>
