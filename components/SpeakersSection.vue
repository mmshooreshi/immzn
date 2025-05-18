<template>
  <section id="voices" class="py-12 mt-10  bg-gradient-to-b from-white/5 via-white/10 to-white/0 overflow-hidden">
    <div class="container mx-auto px-0 max-w-7xl">
      <!-- Headline title -->
      <h2 class="text-4xl sm:text-5xl font-extrabold text-center mb-6 leading-tight drop-shadow-md">
        {{ data?.headline }}
      </h2>

      <!-- Speakers grid -->
      <!-- Mobile-first, fully centered grid of speakers -->
      <div
        class="grid place-items-center gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 max-w-7xl mx-auto px-0">
        <div v-for="sp in data?.people" :key="sp.id" @click="open(sp)" role="listitem"
          :aria-labelledby="`speaker-${sp.id}`"
          class="group relative flex w-full max-w-xs flex-col cursor-pointer rounded-3xl backdrop-blur-sm transition-transform duration-150 ease-in-out hover:scale-105">
          <div class="flex flex-1 flex-col py-6 items-center text-center">
            <!-- Header (keep if confirmed icon will be used) -->
            <!--
      <header class="mb-3 flex flex-row items-start">
        <Icon
          v-if="sp.confirmed"
          name="material-symbols:check-circle-outline-rounded"
          class="h-6 w-6 flex-shrink-0"
          :aria-label="'Confirmed speaker: ' + sp.name"
        />
      </header>
      -->

            <!-- Speaker image & name -->
            <div class="relative overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <img :src="`/images/people/${sp.id}.png`" :alt="`Portrait of ${sp.name}`"
                class="object-cover w-64 h-64 lg:w-66 lg:h-66"
                :style="sp?.id === 'imgt' ? '' : 'filter: grayscale(100%) contrast(100%) brightness(80%)'" />
              <h3 :id="`speaker-${sp.id}`"
                class="w-full py-2 text-md font-extrabold leading-snug text-teal-200/80 transition-colors group-hover:text-primary-400">
                {{ sp.name }}
              </h3>
            </div>

            <!-- Title & affiliation -->
            <div v-if="sp.title" class="text-left mt-6 leading-[18px] text-[12px] text-primary-600">
              <span>{{ sp.title }}</span>
              <p class="mt-1 text-[11px] text-lime-200">{{ sp.affiliation }}</p>
            </div>

            <!-- Brief description -->
            <p
              class="mt-4 text-left min-h-12 overflow-hidden text-xs leading-5 text-gray-200/80 transition-colors group-hover:text-teal-300 line-clamp-4">
              {{ sp.brief }}
            </p>
          </div>
        </div>
      </div> <!-- Speaker modal -->
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
                class="relative bg-white/10 shadow-lg  dark:bg-[#0b0b0d]/60  rounded-3xl shadow-2xl max-w-2xl w-full p-8  max-h-[90vh] ">

                <DialogTitle class=" mb-4 flex flex-col justify-between items-center gap-2 ">



                  <div class="flex-grow"></div>
                  <div class="h-55 md:h-64  bg ml-4 md:w-64 rounded-[2rem] overflow-hidden mt-0 ">
                    <img :src="`/images/people/${selected.id}.png`" alt="Speaker's image"
                      class="object-cover w-55 h-55 md:h-66 md:w-66"
                      :style="selected?.id === 'imgt' ? '' : 'filter: grayscale(100%) contrast(100%) brightness(80%)'" />
                  </div>


                  <div class="z-10">
                    <span class="mx-2 flex items-center min-w-[200%] mt-0  z-50 flex-row gap-2">
                      <Icon v-if="selected?.confirmed || true" name="material-symbols:check-circle-outline-rounded"
                        class="w-7 h-7 flex-shrink-0" style="color: #42ffd9" />
                      <p class="md:text-2xl  mt-0  z-10 font-bold">
                        {{ selected?.name }}</p>
                    </span>
                    <p v-if="selected?.title" class="text-sm min-w-[110%] z-50 text-teal-400 font-medium mt-1">
                      {{ selected.title }}
                    </p>
                    <p class="mt-0 text-teal-700 min-w-[110%] z-50 dark:text-gray-300 text-xs">
                      {{ selected?.affiliation }}
                    </p>
                  </div>
                </DialogTitle>

                <p
                  class="mb-6 max-h-42 overflow-y-auto overflow-x-hidden leading-relaxed text-white/50 dark:text-gray-400 whitespace-pre-line">
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
  data: {
    headline: String,
    people: Array as PropType<Speaker[]>
  }
})

// Current language state (default: English)
const langs = ['en', 'fa'] as const


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




/* Default (mobile) styles, no shifting */
.speaker-item {
  transition: transform 0.3s ease;
}

/* Laptop and desktop styles */
@media (min-width: 1024px) {
  .speaker-item:nth-child(odd) {
    transform: translateY(20px);
    /* Odd items move up by 10px */
  }

  .speaker-item:nth-child(even) {
    transform: translateY(80px);
    /* Even items move down by 10px */
  }
}
</style>
