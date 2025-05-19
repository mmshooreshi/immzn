<!-- layouts/Page.vue -->
<script setup lang="ts">
import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'
import { useThrottleFn } from '@vueuse/core'    // just to avoid spamming sessionStorage
// const isTouch = matchMedia('(pointer:coarse)').matches   // TRUE on iOS/Android

const isMobile = useIsMobile()

/* purely *reading* from the store—no fetching logic here */
const store = useDataStore()
const { localizedData, isLoaded } = storeToRefs(store)
const navbarItems = computed(() => localizedData.value?.navbar ?? [])

const { language, setLanguage, nextLanguage } = useSettings()

const viewLang = ref<Lang>(language.value)
const pendingLang = ref<Lang | null>(null)
watch(language, val => { viewLang.value = val })

function onLangRequest(wanted: Lang) {
  if (viewLang.value === wanted) return         // same → nothing to do
  pendingLang.value = wanted
  viewLang.value = wanted                    // 1️⃣ trigger fade-out

  resetScroll()

}


/**
 * Jump to Y = 0 no matter which scroller is in play.
 */
function resetScroll() {
  const y = 0

  /* Desktop – LocomotiveScroll instance present */
  if (scroll.value) {
    scroll.value.scrollTo(y, { duration: 0, disableLerp: true })
    return
  }

  /* Mobile – native scrolling */
  const main = mainRef.value          // your <main id="main">
  const doc = document.documentElement
  const win = window

  // 1️⃣ try window (typical mobile Safari / Chrome)
  win.scrollTo({ top: y, behavior: 'auto' })

  // 2️⃣ try the main container in case the page scrolls inside it
  if (main) {
    if ('scrollTo' in main) {
      main.scrollTo({ top: y, behavior: 'auto' })
    } else {
      main.scrollTop = y                // old Android WebViews
    }
  }

  // 3️⃣ last-ditch fallback for rare browsers that scroll <html>
  doc.scrollTop = y
}


function onAfterLeave() {
  if (pendingLang.value) {
    setLanguage(pendingLang.value)              // 2️⃣ commit to store
    pendingLang.value = null
  }
}
function onLangEnter() {
  // Wait for Vue to finish inserting the new DOM, then tell loco:
  nextTick(() => {
    resetScroll()
    scroll.value?.start()
    scroll.value?.update()
  })

}


const scroll = ref<LocomotiveScroll | null>(null)
const mainRef = ref<HTMLElement | null>(null)
const cursorContent = ref<string | null>();

provide('scroll', scroll);
provide('cursor', cursorContent);


onMounted(async () => {

  await nextTick()
  if (isMobile.value) {
    /* make sure the container is scrollable */
    mainRef.value?.style.setProperty('overflow-y', 'auto')
    return
  }

  console.log("mainRef", mainRef.value)
  if (!mainRef.value) {
    console.warn('#main element not found');
    return;
  }

  const { default: LocomotiveScroll } = await import('locomotive-scroll');
  scroll.value = new LocomotiveScroll({
    el: mainRef.value!,
    smooth: true,
    multiplier: 0.9,
    smartphone: { smooth: true, breakpoint: 0 },
    tablet: { smooth: true, breakpoint: 1024 },
    scrollbarContainer: document.body,
    reloadOnContextChange: true,
  });
  // More robust: wait until fonts & images are loaded
  const waitForReady = () =>
    new Promise<void>(resolve => {
      if (document.readyState === 'complete') return resolve()
      window.addEventListener('load', () => resolve(), { once: true })
    })

  console.log('[Scroll] mounted mainRef:', mainRef.value)
  // scroll.value?.on('scroll', (args) => {
  //   console.log('[Scroll] scrolling:', args.scroll.y)
  // })

  await waitForReady()
  scroll.value.update()

});

watch(viewLang, () => {
  nextTick(() => {
    scroll.value?.start()
    scroll.value?.update()
  })
})


onUnmounted(() => {
  scroll?.value?.destroy();
});

</script>

<template>
  <!-- 1 — Navbar lives OUTSIDE the smooth-scroll container -->
  <teleport to="body">
    <Transition name="fade" mode="out-in" @after-leave="onAfterLeave">
      <BaseNavbar :key="viewLang" :lang="viewLang" :items="navbarItems" @request-lang="onLangRequest" />
    </Transition>
  </teleport>

  <!-- 2 — Smooth-scroll container keeps everything else -->
  <main id="main" ref="mainRef" data-scroll-container class="main">
    <Transition name="lang" mode="out-in" @after-enter="onLangEnter">
      <div :key="viewLang" class="w-full">
        <slot />
        <CustomCursor v-if="!isMobile" />
      </div>
    </Transition>
  </main>
</template>


<style scoped lang="scss">
.main {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  background-color: #141414;
  will-change: transform;

  overflow-x: hidden;
  // Prevent broken mobile experience
  overflow-y: auto; // default fallback
  // height: 100svh;

  // When LocoScroll is enabled
  html.has-scroll-smooth & {

    // overflow: hidden;
  }

  @include screens.laptop {
    // gap: 16rem;
  }
}


.lang-enter-from,
.lang-leave-to {
  opacity: 0;
  filter: blur(5px);
}

/* blurry & invisible */
.lang-enter-active,
.lang-leave-active {
  transition: opacity 0.3s ease-in-out, filter 0.5s ease-in-out;
}

.lang-enter-to,
.lang-leave-from {
  opacity: 1;
  filter: blur(0);
}

/* sharp & visible */
</style>
