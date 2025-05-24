<!-- @/components/BaseNavbar.vue -->
<script setup lang="ts">
import type { PropType } from 'vue'
import Emitter from '~~/utils/emitter'
// import { useData } from '@/composables/useData'
import { useSettings } from '~/composables/useSettings'
// import { useLocalizedData } from '~/composables/useLocalizedData'
// const localized = useLocalizedData();
// const data = computed(() => localized.value || {}); // fallback to empty object

export type Lang = 'en' | 'fa'

/* props */
const props = defineProps({
  items: {                        // menu data frozen per instance
    type: Array as PropType<Array<{ slug: string; name: string | Record<string, string> }>>,
    required: true,
  },
  lang: {                         //      ← frozen language
    type: String as PropType<Lang>,
    required: true,
  },
})



/* actions we still need (but NOT the reactive `language`) */
const { nextLanguage, theme, toggleTheme } = useSettings()
const isMobile = useIsMobile()
const menuOpen = ref(false)
const route = useRoute()
const scrollTo = useScrollTo()

// const data = useData();

// const open = ref(!isMobile.value);

function isButton(item: any) { return item.slug !== 'register' }

function getItemName(item: any) {
  if (typeof item.name === 'object')
    return item.name[props.lang] ?? item.name.en ?? ''
  return item.name
}
function handleScrollTo(target: string) {
  const OFFSET = -30            // ← +100 = stop below, –100 = stop above
  if (route.path === '/') {
    /* 1️⃣ Locomotive active → use its native offset option */
    if (scroll.value) {
      scroll.value.scrollTo(target, {
        duration: 800,
        offset: OFFSET,
      })
    }
    /* 2️⃣ Native fallback → manual math */
    else {
      const el = document.querySelector<HTMLElement>(target)
      if (!el) return

      const top =
        el.getBoundingClientRect().top +
        window.scrollY +                // current scroll
        OFFSET

      window.scrollTo({ top, behavior: 'smooth' })
    }
  }
  /* 3️⃣ Different page: fire the event as before */
  else {
    Emitter.emit('route-change', `/${target}`)
  }

  menuOpen.value = false

}


const emit = defineEmits<{ (e: 'request-lang', lang: Lang): void }>()

function askForNextLang() {
  // close any open menu inside this instance
  menuOpen.value = false

  // tell the parent which language we want *next*
  emit('request-lang', props.lang === 'en' ? 'fa' : 'en')
}
onBeforeUnmount(() => { menuOpen.value = false })   // keep this

</script>

<template>
  <header v-motion-fade-visible-once
    class=" mx-[2.5%] overflow-hidden w-[95%] z-50 header dark:bg-white/5 bg-black/50 backdrop-blur-2xl  rounded-2xl"
    data-scroll data-scroll-sticky data-scroll-target="main">
    <nav class="nav px-4 py-3 pb-3 flex items-center justify-between">
      <button v-if="!isMobile" class="text-nowrap home-link h-6 px-2" @click="handleScrollTo('#hero')">
        <span v-if="lang == 'en'"> Imm<span class="text-purple-200">Unity</span> Horizons</span>
        <span v-if="lang == 'fa'"> گستره‌ی<span class="text-purple-200"> ایمنی</span></span>
      </button>





      <!-- Mobile Menu -->

      <!-- BaseNavbar.vue -->
      <!-- Mobile Menu -->
      <teleport to="body">
        <ul v-if="menuOpen && isMobile" :key="props.lang"
          class="menno fixed top-26 min-w-[150px] z-[1000] bg-black/30 backdrop-blur-md rounded-3xl p-4 w-max h-max flex flex-col gap-2  text-white">
          <li :key="lang + '-' + item.slug" v-for="item in props.items"
            class="text-lg font-bold hover:bg-gray/10 w-max active:scale-90 transition-all transform-center rounded-xl px-3 py-1 hover:text-purple-300">
            <button v-if="isButton(item)" @click="handleScrollTo(`#${item.slug}`)">
              {{ getItemName(item) }}

            </button>
            <NuxtLink v-else :href="`/${item.slug}`" @click="menuOpen = false">
              {{ getItemName(item) }}

            </NuxtLink>
          </li>
        </ul>

      </teleport>




      <!-- Desktop Menu -->
      <ul class="text-nowrap h-6 list mt-2" v-if="!isMobile">
        <li v-for="item in props.items" :key="item.slug"
          class="text-xs hover:scale-100 scale-90 hover:bg-gray-200/30 !cursor-pointer transition-all duration-200 px-2 py-2 rounded-xl  link"
          :class="{ 'w-full bg-gray-200/30 hover:bg-pink-800 flex-grow': !isButton(item) }">
          <div v-if="isButton(item)" class="" @click="handleScrollTo(`#${item.slug}`)">
            {{ getItemName(item) }}
          </div>
          <NuxtLink v-else :href="`/${item.slug}`">
            {{ getItemName(item) }}
          </NuxtLink>
        </li>
      </ul>

      <div class="flex flex-row-reverse items-center  w-full md:w-min justify-between gap-2">
        <!-- Language Switcher -->
        <button @click="askForNextLang"
          class="w-8 h-8 group hover:scale-105 scale-90 transition-all rounded-xl text-white dark:bg-white/20 bg-black/50 flex items-center justify-center hover:bg-gray-200 hover:text-black"
          :aria-label="`Switch language (current: ${lang.toUpperCase()})`">
          <span class="group-hover:scale-105 scale-90 transition-all">{{ lang == "fa" ? 'فا' : lang.toUpperCase()
          }}</span>
        </button>

        <!-- Theme Toggle -->
        <button @click="toggleTheme"
          class="group w-8 h-8 hover:scale-105 scale-90 transition-all rounded-xl  text-white dark:bg-white/20 bg-black/50 flex items-center justify-center text-gray-700 hover:bg-gray-200"
          :aria-label="`Switch theme (current: ${theme})`">
          <span v-if="theme === 'light'" class="my-auto ">
            <Icon class="w-6 h-6 group-hover:scale-105 scale-90 transition-all mt-1 text-yellow-500"
              name="material-symbols:light-mode" />
          </span>
          <span v-else class="my-auto">
            <Icon class="w-6 h-6  group-hover:scale-105 scale-90 transition-all mt-1 text-blue-500"
              name="material-symbols:dark-mode" />
          </span>
        </button>
        <div class="flex-grow"></div>


        <!-- Hamburger button -->
        <button class="hamburger" @click="menuOpen = !menuOpen" v-if="isMobile">
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
        </button>


      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
@keyframes appear {

  0%,
  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.header {
  // @include mixins.mobile-padding;
  // @include mixins.section-width;

  position: fixed;
  top: 1rem;
  // mix-blend-mode: difference;
  z-index: 999;
  // animation: appear 2s variables.$ease-in-out;


  .nav {
    display: flex;
    // align-items: flex-start;
    // justify-content: space-between;

    .home-link {
      font-weight: 700;
    }

    .list {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      // gap: 0.5rem;
      flex-direction: row;


      @include screens.laptop {
        // flex-direction: row;
        // gap: 2rem;
      }
    }

    .hamburger {

      display: flex;
      flex-direction: column;
      gap: 4px;
      cursor: pointer;

      span {

        display: block;
        width: 24px;
        height: 4px;
        background: white;
        border-radius: 2px;
        transition: all 0.3s ease;

        &.open:nth-child(1) {
          transform: rotate(45deg) translateY(5px) translateX(6px);
        }

        &.open:nth-child(2) {
          opacity: 0;
        }

        &.open:nth-child(3) {
          transform: rotate(-45deg) translateY(-5px) translateX(6px);
        }
      }
    }

    .mobile-menu {
      position: absolute;
      top: 100%;
      right: 5%;
      // backdrop-filter: blur(10px);
      border-radius: 1rem;
      margin-top: 1rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      // gap: 1rem;
      z-index: 998;

      .link {
        text-align: right;
        font-weight: bold;
        white-space: nowrap;
      }
    }
  }
}
</style>