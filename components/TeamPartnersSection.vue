<!-- 3. TeamPartnersSection.vue -->
<script setup>
const props = defineProps({ data: Object });
</script>
<template>
    <section class="py-12 lg:py-20 dark:bg-gray-900">
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-10 w-max mx-auto">{{ data.headline1 }}</h2>
            <div class="grid gap-8 lg:grid-cols-1">
                <!-- Committee -->
                <div>
                    <!-- <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Committee</h3> -->
                    <div class="grid grid-cols-3 grid-rows-2 gap-8">
                        <li v-for="member in props.data.committee" :key="member.name" class="flex items-start">
                            <svg class="h-2 w-2 shrink-0 text-indigo-500 dark:text-indigo-300 mt-1 mr-3"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 100 20 10 10 0 000-20z" />
                            </svg>
                            <div class="mx-2 mt-0">
                                <p class="font-medium text-gray-900 dark:text-gray-100">{{ member.name }}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ member.role }}</p>
                            </div>
                        </li>
                    </div>
                </div>
                <!-- Sponsors -->
                <br />
                <div>
                    <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-300 w-max mx-auto mb-4">{{
                        data.headline2 }}
                    </h3>
                    <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                        <li v-for="s in data.sponsors" :key="s"
                            class="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm text-center text-gray-700 dark:text-gray-300">
                            {{ s }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</template>
