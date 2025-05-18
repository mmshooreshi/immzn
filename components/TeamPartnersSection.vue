<!-- 3. TeamPartnersSection.vue -->
<script setup>
const props = defineProps({ data: Object });
</script>
<template>
    <section class="py-12 lg:py-20 dark:bg-gray-900">
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-10">{{ props.data.headline.en }}</h2>
            <div class="grid gap-8 lg:grid-cols-2">
                <!-- Committee -->
                <div>
                    <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Committee</h3>
                    <ul class="space-y-4">
                        <li v-for="member in props.data.committee" :key="member.name.en" class="flex items-start">
                            <svg class="h-6 w-6 shrink-0 text-indigo-500 dark:text-indigo-300 mt-1 mr-3"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 100 20 10 10 0 000-20z" />
                            </svg>
                            <div>
                                <p class="font-medium text-gray-900 dark:text-gray-100">{{ member.name.en }}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ member.role.en }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <!-- Sponsors -->
                <div>
                    <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Sponsors</h3>
                    <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                        <li v-for="s in props.data.sponsors" :key="s"
                            class="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm text-center text-gray-700 dark:text-gray-300">
                            {{ s }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</template>
