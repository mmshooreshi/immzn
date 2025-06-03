<!-- pages/index.vue -->
<script setup lang="ts">
// import { useData } from '@/composables/useData'
import JsonViewer from '@/components/JsonViewer.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import HomeHeroSection from '~/components/HomeHeroSection.vue'
import HomeAbout from '~/components/HomeAbout.vue'
import SpeakersSection from '~/components/SpeakersSection.vue'
import ProgramSection from '~/components/ProgramSection.vue'
import EssentialsSection from '~/components/EssentialsSection.vue'
import TeamPartnersSection from '~/components/TeamPartnersSection.vue'
import RegisterSection from '~/components/RegisterSection.vue'
import FAQSection from '~/components/FAQSection.vue'
import ContactSection from '~/components/ContactSection.vue'
// import Map from '~/components/Map.vue'
import Mapbx from '~/components/Mapbx.vue'
import SimpleNeshanMap from '~/components/SimpleNeshanMap.client.vue'
import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();

const apiKey = config.public.neshanPublicToken


import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'
import { useSettings } from '~/composables/useSettings'
const { language } = useSettings()

const { localizedData, loading } = storeToRefs(useDataStore())

const initialCenter = computed(() => localizedData.value.map.mapConfig.center as [number, number])
const initialZoom = computed(() => localizedData.value.map.mapConfig.zoom)
const activeTab = ref('marker')

const visibleMarkers = computed(() => {
  // map every route to its origin marker
  const routeMarkers = localizedData.value.map.routes.map(route => ({
    coords: route.origin as [number, number],
    popupHtml: route.originPopupHtml,
    svg: `/icons/${route.type}.svg`,
    label: route.originPopupHtml,
  }))

  // add your existing IPM marker last
  return [
    ...routeMarkers,
    localizedData.value.map.marker
  ]
})


// import { useLocalizedData } from '~/composables/useLocalizedData'
// const localized = useLocalizedData();
// const data = computed(() => localized.value || {}); // fallback to empty object
// console.log(useLocalizedData())

// const data = useData()
const showTree = ref(false)

// useHead({
//   title: 'Colin Lienard | Fullstack Engineer',
//   meta: [
//     {
//       name: 'description',
//       content:
//         "Hi! I'm Colin Lienard, a Fullstack Engineer with a passion for frontend development. I use React, Typescript and Svelte.",
//     },
//   ],
//   script: [
//     {
//       src: 'https://cursor-party.colinlienardpnp.partykit.dev/cursors.js',
//       tagPosition: 'bodyClose',
//     },
//   ],
// });


useHead({
  title: 'ImmUnity Horizons | Tehran · July 9–11, 2025',
  meta: [
    {
      name: 'description',
      content:
        'Where code meets cells. ImmUnity Horizons is a 3-day forum in Tehran blending computation & immunology — with keynotes, a 48-hour hackathon, and workshops. Join us to recode the future of health.',
    },
    // Open Graph (Telegram, Facebook, LinkedIn)
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://immzn.vercel.app' },
    { property: 'og:title', content: 'ImmUnity Horizons | July 9–11 · Tehran' },
    {
      property: 'og:description',
      content:
        'A 3-day summit where researchers, engineers & designers decode immune data. Code sprints, keynotes, and rooftop pizza nights await.',
    },
    { property: 'og:image', content: 'https://immzn.vercel.app/images/event.webp' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'ImmUnity Horizons | July 9–11 · Tehran' },
    {
      name: 'twitter:description',
      content:
        'Join ImmUnity Horizons: 3 days of immune data, algorithms, hackathons & community. Code for health in Tehran or online.',
    },
    { name: 'twitter:image', content: 'https://immzn.vercel.app/images/event.webp' },
  ],
});


</script>

<template>

  <NuxtLayout name="page">
    <LoadingOverlay :show="loading" />


    <!-- <Localized :is="HomeHeroSection" :data="localizedData.hero" /> -->
    <HomeHeroSection v-motion-fade-visible-once :data="localizedData?.hero" />

    <!-- <Localized :is="HomeAbout" :data="localizedData.about" /> -->

    <HomeAbout :data="localizedData.about ?? {}" />

    <!-- {{ localizedData.voices }} -->
    <Localized v-motion-fade-visible-once :is="SpeakersSection" :data="localizedData.voices" />
    <!-- <SpeakersSection  :speakers="localizedData.speakers" :headline="localizedData.navbar"/> -->
    <!-- Your page content -->

    <!-- {{ data }} -->
    <!-- <HomePortfolio /> -->

    <!-- <HomeHeroSection :data="localizedData?.hero" /> -->
    <!-- <HomeAbout :data="localizedData.about ?? {}" /> -->

    <!-- <div id="speakers" class=" w-full h-max">
        <h1></h1>
        <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
        <SpeakersSection :headline="localizedData.navbar ?? []" :speakers="localizedData.speakers ?? []" />
      </div>
 -->
    <!-- 2️⃣ plug in your new sections: -->


    <ProgramSection :program="localizedData.program" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <EssentialsSection :data="{
      headline: localizedData.resources.headline,
      sections: [
        { title: localizedData.resources.headline, items: localizedData.resources.sections },
        { title: localizedData.logistics.headline, items: localizedData.logistics.items }
      ]
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <TeamPartnersSection :data="{
      headline1: localizedData.committee.headline,
      headline2: localizedData.sponsors.headline,
      committee: localizedData.committee.members,
      sponsors: localizedData.sponsors.list
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <!-- <MarkerIcon class="absolute top-[48%] left-[48%] z-10" /> -->
    <!-- <div class=" w-screen h-100 z-100 bg-red">
      <MapboxMap map-id="{ID}" style="width: 100%; height: 100%;" :options="{
        style: 'mapbox://styles/mapbox/light-v11', // style URL
        center: [-68.137343, 45.137451], // starting position
        zoom: 5 // starting zoom
      }" />
    </div> -->

    <div class="w-screen h-[430px] md:h-[480px] overflow-hidden  mx-auto my-8 mt-0">
      <div class="fixed m-6">
        <client-only>
          <SimpleNeshanMap :key="activeTab" :apiKey="apiKey" :markers="visibleMarkers" :routes="[]"
            :initialCenter="initialCenter" :initialZoom="initialZoom" />
        </client-only>
      </div>
    </div>


    <RegisterSection :data="{
      headline: localizedData.register.headline,
      ctaText: localizedData.register.ctaText,
      ctaTitle: localizedData.register.ctaTitle,
      link: localizedData.register.link
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <FAQSection :data="{
      headline: localizedData.faq.headline,
      faq: localizedData.faq.entries ?? localizedData.faq.items
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <ContactSection :data="{
      headline: localizedData.contact.headline,
      contact: localizedData.contact.items,
      outro: localizedData.outro
    }" />
    <!-- <BaseFooter />  -->

    <!-- <HomeContact /> -->
    <!-- <BaseFooter /> -->
  </NuxtLayout>


</template>
