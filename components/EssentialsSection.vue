<!-- 2. EssentialsSection.vue -->
<script setup>
import { Disclosure, TransitionRoot } from '@headlessui/vue';
const props = defineProps({ data: Object });
</script>
<template>
  <section class="py-12 bg-gray-50 dark:bg-gray-800">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{{ props.data.headline.en }}</h2>
      <div class="grid gap-8 sm:grid-cols-2">
        <div v-for="section in props.data.sections" :key="section.title.en">
          <Disclosure v-slot="{ open }">
            <DisclosureButton
              class="flex w-full justify-between rounded-lg bg-indigo-100 dark:bg-indigo-900/40 px-4 py-3 text-left text-lg font-medium text-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none">
              <span>{{ section.title.en }}</span>
              <svg :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5 text-indigo-500" fill="none"
                stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </DisclosureButton>
            <TransitionRoot enter="transition duration-200 ease-out" enter-from="transform scale-y-0 opacity-0"
              enter-to="transform scale-y-100 opacity-100" leave="transition duration-150 ease-in"
              leave-from="transform scale-y-100 opacity-100" leave-to="transform scale-y-0 opacity-0">
              <DisclosurePanel as="ul" class="mt-2 space-y-2 pl-4 list-disc text-gray-700 dark:text-gray-300">
                <li v-for="item in section.items" :key="item.en">{{ item.en }}</li>
              </DisclosurePanel>
            </TransitionRoot>
          </Disclosure>
        </div>
      </div>
    </div>
  </section>
</template>
