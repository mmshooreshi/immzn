<template>
  <section id="program" class="bg-[#0b0b0d]/80 dark:bg-white/50 text-white dark:text-[#0b0b0d] py-12">
    <h2 class="text-3xl font-bold text-center mb-8">{{ data.headline }}</h2>
    <ul class="space-y-8 max-w-3xl mx-auto">
      <li v-for="(item, idx) in data.items" :key="idx" class="group">
        <h3 class="text-xl font-semibold mb-2">{{ item.title }}</h3>
        <p class="text-gray-700" v-for="(line, i) in item.details" :key="i">{{ line }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: {
    headline: string;
    items: Array<{ title: string; details: string[] }>;
  };
}>();
</script>