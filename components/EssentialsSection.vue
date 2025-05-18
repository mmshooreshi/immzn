// components/EssentialsSection.vue
<template>
  <section id="essentials" class="py-12 bg-[#0b0b0d]/80 dark:bg-white/50 text-white dark:text-[#0b0b0d] ">
    <h2 class="text-3xl font-bold text-center mb-8">{{ data.headline }}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div v-for="(section, idx) in data.sections" :key="idx">
        <h3 class="text-2xl font-semibold mb-4">{{ section.title }}</h3>
        <ul class="space-y-2">
          <li v-for="(item, i) in section.items" :key="i">
            <p class="text-gray-800">{{ item.name }}</p>
            <a v-if="item.link" :href="item.link" target="_blank" class="text-blue-600 hover:underline text-sm">
              {{ item.linkText || 'Learn more' }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
const props = defineProps<{
  data: {
    headline: string;
    sections: Array<{
      title: string;
      items: Array<{ name: string; link?: string; linkText?: string }>;
    }>;
  };
}>();
</script>