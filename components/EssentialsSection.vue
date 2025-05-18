<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
const props = defineProps({ data: Object });
</script>


<template>
  <section class="py-12 bg-gray-50 dark:bg-gray-800">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{{ data.headline }}</h2>
      <div class="grid gap-8 sm:grid-cols-2">
        <div v-for="section in data.sections" :key="section.title">
          <Disclosure v-slot="{ open }">
            <div>
              <DisclosureButton
                class="flex w-full justify-between rounded-lg bg-indigo-100 dark:bg-indigo-900/40 px-4 py-3 text-left text-lg font-medium text-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none">
                <span>{{ section.title }}</span>
                <svg :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5 text-indigo-500" fill="none"
                  stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </DisclosureButton>

              <!-- Transition for sliding down/up -->
              <transition name="accordion" @before-enter="beforeEnter" @enter="enter" @before-leave="beforeLeave"
                @leave="leave">
                <div v-show="open">
                  <DisclosurePanel static as="ul"
                    class="mt-2 space-y-6 pl-4 list-disc text-gray-700 dark:text-gray-300">
                    <li class="mx-8 mt-8" v-for="item in section.items" :key="item.title ?? item">
                      {{ item.title ?? item }}
                      <ul class="space-y-2 mt-2 text-xs">
                        <li v-for="subItem in item.items" :key="subItem">{{ subItem }}</li>
                      </ul>
                    </li>
                  </DisclosurePanel>
                </div>
              </transition>
            </div>
          </Disclosure>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// These methods enable max-height transitions for accordion slide
function beforeEnter(el) {
  el.style.maxHeight = '0'
  el.style.opacity = '0'
}
function enter(el) {
  el.style.transition = 'max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s'
  el.style.maxHeight = el.scrollHeight + 'px'
  el.style.opacity = '1'
}
function beforeLeave(el) {
  el.style.maxHeight = el.scrollHeight + 'px'
  el.style.opacity = '1'
}
function leave(el) {
  el.style.transition = 'max-height 0.2s cubic-bezier(.4,0,.2,1), opacity 0.2s'
  el.style.maxHeight = '0'
  el.style.opacity = '0'
}
</script>

<style>
/* Prevent jumpiness on enter/leave */
.accordion-enter-active,
.accordion-leave-active {
  overflow: hidden;
}
</style>
