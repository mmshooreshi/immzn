<script setup lang="ts">
import { useData } from '@/composables/useData'
import JsonViewer from '@/components/JsonViewer.vue'
const data = useData()
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
  title: 'ImmUnity Horizons | Bridging Computation & Immunology',
  meta: [
    {
      name: 'description',
      content:
        'ImmUnity Horizons is a three-day gathering in Tehran (July 9–11, 2025) uniting researchers, engineers, and designers to decode immune data. Join us for keynotes, a 48-hour hackathon, and hands-on workshops that spark the future of health tech.',
    },
    {
      name: 'og:title',
      content: 'ImmUnity Horizons 2025',
    },
    {
      name: 'og:description',
      content:
        'Where code meets cells: Join ImmUnity Horizons in Tehran for keynotes, hackathons, and immune-inspired innovation.',
    },
    {
      name: 'og:image',
      content: '/images/event.webp',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
  ],
  link: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
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
      tapCount.value ++
      if (tapCount.value  >= 7) {
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

  <NuxtLayout name="page">
    
  
    <HomeHeroSection :data="data['0_hero']" />
    <HomeAbout :data="data['1_why']" />
    <!-- <HomePortfolio /> -->

    <div id="speakers" class=" w-full h-max"><h1></h1> <hr class="w-[20%] border-gray/40 mx-auto mt-4"/>
      <!-- {{ Object.keys(data.speakers) }} -->
      <SpeakersSection :speakers="data.speakers" />
    </div>
    <div id="program" class="text-center h-max w-full"><h1>Program</h1> <hr class="w-[20%] border-gray/40 mx-auto mt-4"/>
      <JsonViewer :data="data['4_hackathon']" class="h-full" />

    </div>
    <div id="essentials" class="text-center h-max w-full"><h1>Essentials</h1> <hr class="w-[20%] border-gray/40 mx-auto mt-4"/>
      <JsonViewer :data="data['5_resources']" class="h-full" />
      <JsonViewer :data="data['6_logistics']" class="h-full" />

    </div>

    <div id="team-partners" class="text-center h-max w-full"><h1>Team & Partners</h1> <hr class="w-[20%] border-gray/40 mx-auto mt-4"/>
      <JsonViewer :data="data['8_committee']" class="h-full" />
      <JsonViewer :data="data['7_sponsors']" class="h-full" />

    </div>
    <div id="register" class="text-center h-max w-full"><h1>Register</h1> <hr class="w-[20%] border-gray/40 mx-auto mt-4"/></div>
    <div id="faq" class="text-center h-max w-full"><h1>FAQ</h1> <hr class="w-[20%] border-gray/40 mx-auto mt-4"/>
      <JsonViewer :data="data['9_faq']" class="h-full" />
    </div>
    <div id="contact" class="text-center h-max w-full"><h1>Contact</h1> <hr class="w-[20%] border-gray/40 mx-auto mt-4"/>
      <JsonViewer :data="data['11_contact']" class="h-full" />
      <JsonViewer :data="data['10_outro']" class="h-full" />

    </div>
    
    <HomeContact />
    <BaseFooter />
  </NuxtLayout>
</template>
