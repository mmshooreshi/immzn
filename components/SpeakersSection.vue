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
        class="grid place-items-center gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 max-w-7xl mx-auto px-0 lg:mx-56">
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
            <div
              class="relative overflow-hidden rounded-2xl border border-white/20 shadow-lg outline transition-all group-hover:outline-8 outline-offset-0 outline-teal/5 shadow-lg ">
              <div class="relative group">

                <img :src="`/images/people/${sp.id}.png`" :alt="`Portrait of ${sp.name}`"
                  class="group-hover:opacity-20 transition-all  object-cover w-64 h-64 lg:w-66 lg:h-66"
                  :style="sp?.id === 'imgt' ? '' : 'filter: grayscale(100%) contrast(100%) brightness(80%)'" />
                <p class="absolute top-0 p-2 text-left z-100 min-h-12 overflow-hidden text-xs leading-5
           text-gray-200/80  opacity-0 z-100 
           group-hover:opacity-100 group-hover:text-teal-300
           transition-opacity duration-500" :class="{ 'text-left': language == 'en', 'text-right': language == 'fa' }">
                  {{ sp.brief }}
                </p>
              </div>


              <h3 :id="`speaker-${sp.id}`"
                class="w-full text-center py-2 text-md font-extrabold leading-snug text-teal-200/80 transition-colors group-hover:text-primary-400">
                {{ sp.name }}
              </h3>
            </div>

            <!-- Title & affiliation -->
            <div v-if="sp.title" :class="{ 'text-left': language == 'en', 'text-right': language == 'fa' }"
              class=" mt-6 leading-[18px] text-[12px] text-primary-600">
              <span>{{ sp.title }}</span>
              <p class="mt-1 text-[11px] text-lime-200">{{ sp.affiliation }}</p>
            </div>

            <!-- Brief description -->
          </div>
        </div>
      </div> <!-- Speaker modal -->

      <Modal :open="isOpen" @close="isOpen = false">
        <div class="text-white  flex flex-col items-center"
          :class="{ 'text-left': language == 'en', 'text-right': language == 'fa' }">
          <img :src="`/images/people/${selected.id}.png`" alt="" class="rounded-2xl w-48 h-48 object-cover mx-auto"
            :style="selected?.id === 'imgt' ? '' : 'filter: grayscale(100%) contrast(100%) brightness(80%)'" />

          <div class="flex flex-row items-center mt-4">
            <Icon v-if="selected?.id === 'imgt'" class="w-8 text-[#b9ffcc] h-6" name="charm:north-star" />
            <Icon v-else class="w-8 text-[#b9ffcc] h-6" name="fluent:person-star-28-filled" />
            <h2 class="text-xl font-bold">{{ selected.name }}</h2>
          </div>
          <p class="text-teal-400 text-sm pt-2 mt-2 border-t border-t-solid border-t-gray/10 w-full">{{ selected.title
            }}</p>
          <p class="text-gray-400 text-xs  w-full">{{ selected.affiliation }}</p>
          <p class="text-white/60 max-h-[200px] overflow-y-auto text-sm whitespace-pre-line mt-8">{{ selected.brief }}
          </p>
          <div class="flex justify-center gap-4 mt-4">

            <a v-if="selected?.scholar" :href="selected.scholar" target="_blank"
              class="group flex flex-row gap-2 items-center bg-blue-800 px-3 py-1.5 rounded-2xl text-sm text-blue-100 hover:bg-blue-100 hover:text-blue-800 transition">
              <span class="">Google Scholar</span>
              <Icon name="fa6-brands:google-scholar"
                class="transition-all group-hover:text-blue-800 w-5 h-5 text-white" />
            </a>
            <a v-if="selected?.website" :href="selected.website" target="_blank"
              class="group flex flex-row gap-2 items-center  bg-blue-800 px-3 py-1.5 rounded-2xl text-sm text-blue-100 hover:bg-blue-100 hover:text-blue-800 transition">
              Website
              <Icon name="mdi:web" class="transition-all w-5 h-5 group-hover:text-blue-800 text-white" />
            </a>
          </div>
        </div>
      </Modal>

    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
// import { PropType } from 'vue'
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Icon } from '#components'
import { useSettings } from '~/composables/useSettings'
import Modal from '@/components/Modal.vue';
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


@keyframes trackingExpand {
  from {
    letter-spacing: 0px;
  }

  to {
    letter-spacing: 1px;
  }
}


@keyframes trackingCollapse {
  from {
    letter-spacing: 1px;
  }

  to {
    letter-spacing: 0px;
  }
}
</style>
