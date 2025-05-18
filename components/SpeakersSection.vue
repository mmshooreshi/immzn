<template>
  <section id="voices" class="py-12 mt-10  bg-gradient-to-b from-white/5 via-white/10 to-white/0 overflow-hidden">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Headline title -->
      <h2 class="text-4xl sm:text-5xl font-extrabold text-center mb-6 leading-tight drop-shadow-md">
        {{ data?.headline }}
      </h2>

      <!-- Speakers grid -->
      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 lg:mx-46">
        <div v-for="sp in data?.people" :key="sp.id" @click="open(sp)"
          class="group hover:scale-105 transition-all duration-100 ease relative flex flex-col rounded-[3rem] cursor-pointer backdrop-blur-sm speaker-item"
          role="listitem" :aria-labelledby="`speaker-${sp.id}`">
          <div class="p-6  flex-1 flex flex-col">

            <header class="flex items-start flex-row  mb-3 ">

              <!-- <Icon v-if="sp.confirmed" name="material-symbols:check-circle-outline-rounded"
                class="w-6 h-6 flex-shrink-0" :aria-label="'Confirmed speaker: ' + sp.name" /> -->




            </header>
            <div class="">
              <div v-if="1"
                class="mx-auto w-66 h-max relative  rounded-[2rem]  overflow-hidden border border-0 border-white/20 outline transition-all group-hover:outline-8 outline-offset-0 outline-white/5 shadow-lg  border-solid border-x-solid"
                :class="{ '': language == 'fa', '': language == 'en' }">
                <img :src="`/images/people/${sp.id}.png`" alt="Speaker's image" class="object-cover w-66 bg-white/50"
                  :style="sp?.id === 'imgt' ? '' : 'filter: grayscale(100%) contrast(100%) brightness(80%)'" />
                <h3
                  class="font-extrabold text-md  py-1 w-64 -mr-1   leading-snug group-hover:text-primary-400 transition-colors    text-center mb-1  rounded-b-[1.9rem] text-nowrap   text-teal-200/80  "
                  :class="{ '': language == 'fa', '': language == 'en' }" :id="`speaker-${sp.id}`">
                  {{ sp.name }}
                </h3>

              </div>
              <div v-if="sp.title" class="w-max mx-auto leading-[18px] text-[12px] text-primary-600 mt-6"
                :class="{ 'text-left': language == 'en', 'text-right': language == 'fa' }">
                {{ sp.title }} <br />
                <p class="text-[11px] mt-1 text-lime-200 "> {{ sp.affiliation }}</p>

              </div>
            </div>





            <p class="group-hover:text-teal-300  scale-110  text-gray-200/30 transition-all text-xs  !overflow-hidden min-h-12 leading-5 mt-4    line-clamp-4"
              :class="{ 'ml-4 mr-18': language == 'en', 'mx-8': language == 'fa' }">
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
                class="relative bg-[#0b0b0d]/80 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-2xl w-full p-8  max-h-[90vh] ">

                <DialogTitle class=" mb-4 flex flex-col justify-between items-center gap-2 ">



                  <div class="flex-grow"></div>
                  <div class="h-66 bg ml-4 md:w-64 rounded-[2rem] overflow-hidden mt-0 ">
                    <img :src="`/images/people/${selected.id}.png`" alt="Speaker's image" class="object-cover w-66 h-66"
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
