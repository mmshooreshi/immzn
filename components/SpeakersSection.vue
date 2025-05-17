<template>
  <section id="speakers" class="py-16 bg-gradient-to-b from-white/5 via-white/10 to-white/0 overflow-hidden">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Headline title -->
      <h2 class="text-4xl sm:text-5xl font-extrabold text-center mb-14 leading-tight drop-shadow-md">
        {{ sectionTitle }}
      </h2>

      <!-- Speakers grid -->
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="sp in props.speakers" :key="sp.id" @click="open(sp)"
          class="group relative flex flex-col bg-white/10 rounded-3xl shadow-md hover:shadow-xl cursor-pointer transition-shadow duration-300 backdrop-blur-sm"
          role="listitem" :aria-labelledby="`speaker-${sp.id}`">
          <div class="p-6 flex-1 flex flex-col">
            <header class="flex items-start gap-2 mb-3">
              <div v-if="1" class="relative w-20 h-20 -mt-2 rounded-full overflow-hidden">
                <img :src="`/images/people/${sp.id}.png`" alt="Speaker's image" class="object-cover w-full h-full"
                  style="filter: grayscale(100%) contrast(100%) brightness(80%)" />
              </div>
              <Icon v-if="sp.confirmed" name="material-symbols:check-circle-outline-rounded"
                class="w-6 h-6 flex-shrink-0" :aria-label="'Confirmed speaker: ' + sp.name" />
              <h3 class="text-lg font-semibold leading-snug group-hover:text-primary-400 transition-colors"
                :id="`speaker-${sp.id}`">
                {{ sp.name }}
              </h3>
            </header>

            <p v-if="sp.title" class="text-xs text-primary-600  mt-8"
              :class="{ 'text-left ml-22': currentLang == 'en', 'text-right mr-22': currentLang == 'fa' }">
              {{ sp.title }}, <br /> <span class="text-[11px] text-gray-400 "> {{ sp.affiliation }}</span>

            </p>
            <p>

            </p>

            <p class="text-xs text-blue-500 mt-4 tracking-wider">
              {{ sp.role }}
            </p>



            <p class="text-sm  !overflow-hidden min-h-16 mt-4 text-teal-400   line-clamp-4">
              <span>{{ sp.brief }}</span>
              <span>...</span>
            </p>
          </div>
        </div>
      </div>


      <!-- Speaker modal -->
      <TransitionRoot as="template" :show="isOpen">
        <Dialog as="div" class="fixed inset-0 z-50" @close="isOpen = false">
          <div class="flex items-center justify-center min-h-screen p-4">
            <DialogOverlay class="fixed  inset-0 bg-black/30 backdrop-blur-xl transition-all" />
            <TransitionChild as="template" enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">


              <div
                class="relative bg-[#0b0b0d]/80 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-2xl w-full p-8 overflow-y-visible max-h-[90vh] ">

                <DialogTitle class="mb-4 flex justify-between items-center gap-2 ">


                  <div>
                    <span class="flex flex-row gap-2">
                      <Icon v-if="selected?.confirmed" name="material-symbols:check-circle-outline-rounded"
                        class="w-7 h-7 flex-shrink-0" style="color: #42ffd9" />
                      <p class="text-2xl font-bold">
                        {{ selected?.name }}</p>
                    </span>
                    <p v-if="selected?.title" class="text-sm text-teal-400 font-medium mt-4">
                      {{ selected.title }}
                    </p>
                    <p class="mt-0 text-teal-700 dark:text-gray-300 text-xs">
                      {{ selected?.affiliation }}
                    </p>
                  </div>

                  <div class="flex-grow"></div>
                  <div class="w-56 h-56 mr-2 rounded-full overflow-hidden -mt-16 mr-6 -ml-6"> <img
                      :src="`/images/people/${selected.id}.png`" alt="Speaker's image"
                      class="object-cover w-full h-full"
                      style="filter: grayscale(100%) contrast(100%) brightness(80%)" />
                  </div>
                </DialogTitle>

                <p class="mb-6 leading-relaxed text-white/50 dark:text-gray-400 whitespace-pre-line">
                  {{ selected?.brief }}
                </p>

                <div class="group  transition-all transform-origin-left flex flex-wrap gap-4">
                  <a v-if="selected?.scholar" :href="selected.scholar" target="_blank" rel="noopener noreferrer"
                    class="bg-blue-800 p-2 rounded-3xl inline-flex items-center gap-1 text-sm font-semibold text-blue-100 hover:bg-blue-100 hover:text-blue-800 transition-all hover:underline">
                    <Icon name="fa6-brands:google-scholar"
                      class="transition-all group-hover:text-blue-800 w-5 h-5 text-white" />
                    Google Scholar
                  </a>
                  <a v-if="selected?.website" :href="selected.website" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                    <Icon name="mdi:web" class="w-5 h-5" />
                    Website
                  </a>
                </div>

                <!-- Close button -->
                <button @click="isOpen = false"
                  class="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <Icon name="mdi:close" class="w-6 h-6" />
                </button>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
// import { PropType } from 'vue'
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Icon } from '#components'
import { useSettings } from '~/composables/useSettings'
const { language } = useSettings()

interface HeadlineItem {
  slug: string
  name: string
}

const props = defineProps({
  speakers: {
    type: Array as PropType<Speaker[]>,
    required: true
  },
  headline: {
    type: Array as PropType<HeadlineItem[]>,
    required: true
  }
})

// Current language state (default: English)
const currentLang = ref<'en' | 'fa'>('en')
const langs = ['en', 'fa'] as const

// Section title from headline prop
const sectionTitle = computed(() => {
  currentLang.value = language.value
  return (
    props.headline?.find((item) => item.slug === 'speakers')?.name ||
    (currentLang.value === 'fa' ? 'سخنرانان' : 'Speakers')
  )
})

// Modal state
const isOpen = ref(false)
const selected = ref<Speaker | null>(null)

function open(sp: Speaker) {
  selected.value = sp
  isOpen.value = true
}
</script>

<style scoped>
/* Fallback line‑clamp when Tailwind plugin is unavailable */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
