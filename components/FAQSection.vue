<!-- 5. FAQSection.vue -->
<script setup>
import { Disclosure, TransitionRoot } from '@headlessui/vue';
const props = defineProps({ data: Object });
</script>
<template>
    <section class="py-12 bg-gray-50 dark:bg-gray-800">
        <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">{{ props.data.headline.en }}</h2>
            <div class="space-y-4">
                <Disclosure v-for="item in props.data.faq" :key="item.q.en" v-slot="{ open }">
                    <DisclosureButton
                        class="w-full flex justify-between rounded-lg bg-indigo-100 dark:bg-indigo-900/40 px-4 py-3 text-left text-lg font-medium text-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none">
                        <span>{{ item.q.en }}</span>
                        <svg :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5 text-indigo-500" fill="none"
                            stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </DisclosureButton>
                    <TransitionRoot enter="transition duration-200 ease-out" enter-from="opacity-0"
                        enter-to="opacity-100" leave="transition duration-150 ease-in" leave-from="opacity-100"
                        leave-to="opacity-0">
                        <DisclosurePanel
                            class="px-4 pt-2 pb-4 text-gray-700 dark:text-gray-300 border-l-4 border-indigo-500 dark:border-indigo-400">
                            {{ item.a.en }}
                        </DisclosurePanel>
                    </TransitionRoot>
                </Disclosure>
            </div>
        </div>
    </section>
</template>
