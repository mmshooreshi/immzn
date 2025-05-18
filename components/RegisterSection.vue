<!-- 4. RegisterSection.vue -->
<script setup>
const props = defineProps({ data: Object });
</script>
<template>
    <section class="py-16 bg-indigo-600 dark:bg-indigo-700 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">{{ props.data.headline.en }}</h2>
        <p class="text-lg text-indigo-200 max-w-2xl mx-auto mb-8">{{ props.data.ctaText.en }}</p>
        <a :href="props.data.link"
            class="inline-block rounded-md bg-white px-6 py-3 text-indigo-700 font-semibold hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
            Register
        </a>
    </section>
</template>
