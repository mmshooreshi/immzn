<!-- 1. ProgramSection.vue -->
<script setup>
import { computed } from 'vue';
const props = defineProps({ data: Object });

const dialogue = computed(() => props.data.schedule?.day_of_dialogue);
</script>
<template>
  <section class="py-12 lg:py-20 dark:bg-gray-900">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
        {{ props.data.headline ?? 'Program' }}
      </h2>
      <!-- Dialogue Day headline -->
      <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4" v-if="dialogue">
        {{ dialogue.headline }}
        <small>{{ dialogue.date }}</small>

      </h3>
      <ul class="space-y-6">
        <li v-for="slot in dialogue.slots" :key="slot.time" class="flex flex-col sm:flex-row sm:items-start">
          <div class="w-32 shrink-0 text-sm font-mono text-indigo-600 dark:text-indigo-300">
            {{ slot.time }}
          </div>
          <p class="text-gray-800 dark:text-gray-200 sm:ml-4">{{ slot.title }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
