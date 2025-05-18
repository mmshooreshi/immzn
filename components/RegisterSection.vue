// components/RegisterSection.vue
<template>
    <section id="register" class="py-12 bg-blue-50">
        <h2 class="text-3xl font-bold text-center mb-8">{{ data.headline }}</h2>
        <div class="text-center">
            <a :href="data.link"
                class="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                {{ data.ctaText }}
            </a>
        </div>
    </section>
</template>

<script setup lang="ts">
const props = defineProps<{
    data: {
        headline: string;
        ctaText: string;
        link: string;
    };
}>();
</script>
