// components/FAQSection.vue
<template>
    <section id="faq" class="py-12 bg-[#0b0b0d]/80 dark:bg-white/50 text-white dark:text-[#0b0b0d] ">
        <h2 class="text-3xl font-bold text-center mb-8">{{ data.headline }}</h2>
        <div class="max-w-3xl mx-auto space-y-4">
            <details v-for="(item, idx) in data.faq" :key="idx" class="p-4 border rounded-lg">
                <summary class="font-semibold cursor-pointer">{{ item.question }}</summary>
                <p class="mt-2 text-gray-700">{{ item.answer }}</p>
            </details>
        </div>
    </section>
</template>

<script setup lang="ts">
const props = defineProps<{
    data: {
        headline: string;
        faq: Array<{ question: string; answer: string }>;
    };
}>();
</script>
