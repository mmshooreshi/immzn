<!-- layouts/Page.vue -->
<script setup lang="ts">
import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'
import { useThrottleFn } from '@vueuse/core'    // just to avoid spamming sessionStorage

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


  scroll.value.scrollTo(parseFloat(0), {
    duration: 1,
    disableLerp: true,
  })
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

  console.log("mainRef", mainRef.value)
  if (!mainRef.value) {
    console.warn('#main element not found');
    return;
  }

  const { default: LocomotiveScroll } = await import('locomotive-scroll');
  scroll.value = new LocomotiveScroll({
    el: mainRef.value!,
    smooth: true,
    multiplier: 0.8,
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

  // Prevent broken mobile experience
  overflow: auto; // default fallback
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
