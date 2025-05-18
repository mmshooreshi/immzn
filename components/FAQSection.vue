<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
const props = defineProps({ data: Object })

// Accordion transition JS hooks
function beforeEnter(el) {
    el.style.maxHeight = '0'
    el.style.opacity = '0.5'
}
function enter(el) {
    el.style.transition = 'max-height 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s'
    el.style.maxHeight = el.scrollHeight + 'px'
    el.style.opacity = '1'
}
function afterEnter(el) {
    el.style.maxHeight = 'none'
}
function beforeLeave(el) {
    el.style.maxHeight = el.scrollHeight + 'px'
    el.style.opacity = '1'
}
function leave(el) {
    el.style.transition = 'max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s'
    el.style.maxHeight = '0'
    el.style.opacity = '0.5'
}
function afterLeave(el) {
    el.style.maxHeight = ''
    el.style.opacity = ''
}
</script>

<template>
    <section class="py-12 bg-gray-50 dark:bg-gray-800">
        <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">{{ data.headline }}</h2>
            <div class="space-y-4">
                <Disclosure v-for="item in data.faq" :key="item.q" v-slot="{ open }">
                    <div>
                        <DisclosureButton
                            class="w-full flex justify-between rounded-lg bg-indigo-100 dark:bg-indigo-900/40 px-4 py-3 text-left text-lg font-medium text-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none">
                            <span>{{ item.q }}</span>
                            <svg :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5 text-indigo-500" fill="none"
                                stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </DisclosureButton>
                        <transition @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter"
                            @before-leave="beforeLeave" @leave="leave" @after-leave="afterLeave">
                            <div v-show="open" class="overflow-hidden">
                                <DisclosurePanel static
                                    class="px-4 pt-2 pb-4 text-gray-700 dark:text-gray-300 border-l-4 border-indigo-500 dark:border-indigo-400">
                                    {{ item.a }}
                                </DisclosurePanel>
                            </div>
                        </transition>
                    </div>
                </Disclosure>
            </div>
        </div>
    </section>
</template>
