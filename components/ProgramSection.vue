<script setup lang="ts">
import { defineProps } from 'vue'
import { MotionPlugin, useMotion } from '@vueuse/motion'

const props = defineProps<{ program: any[] }>()

// Initialize MotionPlugin globally in your main.js or here for demo
// const nuxtApp = useNuxtApp()
// nuxtApp.use(MotionPlugin)
</script>

<template>
  {{ program }}
  <section id="program" class="py-12 lg:py-20 bg-white dark:bg-[#141414]">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
        {{ program.headline }}
      </h2>
      <!-- Desktop Grid -->
      <div class="hidden lg:grid grid-cols-3 gap-8">
        <div v-for="day in props.program" :key="day.id" v-motion :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: (day.id - 1) * 0.2, duration: 0.6 } }"
          class="bg-indigo-50 dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col">
          <h3 class="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
            {{ day.day }} • {{ day.date }}
          </h3>
          <p class="mt-1 text-gray-700 dark:text-gray-400 italic">
            {{ day.title }}
          </p>

          <ul class="mt-6 space-y-4 flex-1 overflow-y-auto">
            <li v-for="session in day.sessions" :key="session.time.start + session.title.en" class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-mono text-indigo-600 dark:text-indigo-300">
                  {{ session.time.start }}–{{ session.time.end }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="session.speaker?.status === 'Confirmed'
                  ? 'bg-green-100 text-green-800'
                  : session.speaker?.status?.startsWith('*')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'">
                  {{ session.speaker?.status || '' }}
                </span>
              </div>
              <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                {{ session.title }}
              </h4>
              <p v-if="session.speaker" class="text-sm text-gray-600 dark:text-gray-300">
                {{ session.speaker.name }}<span v-if="session.speaker.affiliation"> — {{
                  session.speaker.affiliation }}</span>
              </p>
              <p v-if="session.description?.en" class="text-sm text-gray-700 dark:text-gray-400">
                {{ session.description }}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Mobile Accordion -->
      <div class="lg:hidden space-y-4">
        <details v-for="day in props.program" :key="day.id"
          class="bg-indigo-50 dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <summary
            class="px-6 py-4 flex justify-between items-center cursor-pointer text-lg font-semibold text-indigo-600 dark:text-indigo-300">
            <span>{{ day.day }} • {{ day.date }}</span>
            <svg class="w-6 h-6 transform transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor"
              xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
            </svg>
          </summary>
          <ul class="px-6 pb-4 space-y-4">
            <li v-for="session in day.sessions" :key="session.time.start + session.title.en">
              <div class="flex items-center justify-between">
                <span class="text-sm font-mono text-indigo-600 dark:text-indigo-300">
                  {{ session.time.start }}–{{ session.time.end }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="session.speaker?.status === 'Confirmed'
                  ? 'bg-green-100 text-green-800'
                  : session.speaker?.status?.startsWith('*')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'">
                  {{ session.speaker?.status || '' }}
                </span>
              </div>
              <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">
                {{ session.title }}
              </h4>
              <p v-if="session.speaker" class="text-sm text-gray-600 dark:text-gray-300">
                {{ session.speaker.name }}
              </p>
            </li>
          </ul>
        </details>
      </div>
    </div>
  </section>
</template>
