// components/ContactSection.vue
<template>
    <section id="contact" class="py-12 bg-[#0b0b0d]/80 dark:bg-white/50 text-white dark:text-[#0b0b0d] ">
        <h2 class="text-3xl font-bold text-center mb-8">{{ data.headline }}</h2>
        <div class="max-w-2xl mx-auto space-y-6 text-center">
            <p v-if="data.outro" class="text-gray-700">{{ data.outro }}</p>
            <ul class="space-y-2">
                <li v-for="(item, idx) in data.contact" :key="idx">
                    <a v-if="item.link" :href="item.link" class="text-blue-600 hover:underline" target="_blank">
                        {{ item.type }}: {{ item.value }}
                    </a>
                    <span v-else>{{ item.type }}: {{ item.value }}</span>
                </li>
            </ul>
        </div>
    </section>
</template>

<script setup lang="ts">
const props = defineProps<{
    data: {
        headline: string;
        outro?: string;
        contact: Array<{ type: string; value: string; link?: string }>;
    };
}>();
</script>