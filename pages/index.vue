<script setup lang="ts">
// import { useData } from '@/composables/useData'
import JsonViewer from '@/components/JsonViewer.vue'
import { useSettings } from '~/composables/useSettings'

const { language } = useSettings()

import { useLocalizedData } from '~/composables/useLocalizedData'

const data = useLocalizedData()  // now `data.value.speakers`, etc. all have plain strings
console.log(useLocalizedData())
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


const tapCount = ref(0)
onMounted(() => {
  tapCount.value = 0
  let lastTap = 0
  const tapTimeout = 600 // ms

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap > tapTimeout) {
      tapCount.value = 1
    } else {
      tapCount.value++
      if (tapCount.value >= 7) {
        showTree.value = true
      }
    }
    lastTap = now
  }

  window.addEventListener('touchend', handleTap)
  window.addEventListener('mouseup', handleTap)

})

</script>

<template>
  <teleport to="body">
    <Tree v-show="showTree" />
    <!-- {{ tapCount }} {{  showTree }} -->
  </teleport>

  <NuxtLayout :key="language" name="page">
    <!-- {{ language }} -->
    <!-- {{ data }} -->

    <HomeHeroSection :data="data['0_hero']" />
    <HomeAbout :data="data['1About']" />
    <!-- <HomePortfolio /> -->

    <div id="speakers" class=" w-full h-max">
      <h1></h1>
      <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
      <!-- {{ Object.keys(data.speakers) }} -->
      <SpeakersSection :headline="data.navbar" :speakers="data.speakers" />
    </div>
    <div id="program" class="text-center h-max w-full">
      <h1>Program</h1>
      <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
      <JsonViewer :data="data['4_hackathon']" class="h-full" />

    </div>
    <div id="essentials" class="text-center h-max w-full">
      <h1>Essentials</h1>
      <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
      <JsonViewer :data="data['5_resources']" class="h-full" />
      <JsonViewer :data="data['6_logistics']" class="h-full" />

    </div>

    <div id="team-partners" class="text-center h-max w-full">
      <h1>Team & Partners</h1>
      <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
      <JsonViewer :data="data['8_committee']" class="h-full" />
      <JsonViewer :data="data['7_sponsors']" class="h-full" />

    </div>
    <div id="register" class="text-center h-max w-full">
      <h1>Register</h1>
      <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
    </div>
    <div id="faq" class="text-center h-max w-full">
      <h1>FAQ</h1>
      <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
      <JsonViewer :data="data['9_faq']" class="h-full" />
    </div>
    <div id="contact" class="text-center h-max w-full">
      <h1>Contact</h1>
      <hr class="w-[20%] border-gray/40 mx-auto mt-4" />
      <JsonViewer :data="data['11_contact']" class="h-full" />
      <JsonViewer :data="data['10_outro']" class="h-full" />

    </div>

    <HomeContact />
    <BaseFooter />
  </NuxtLayout>
</template>
