<!-- @/components/BaseNavbar.vue -->
<script setup lang="ts">
import Emitter from '~~/utils/emitter'
// import { useData } from '@/composables/useData'
import { ref, computed, watch } from 'vue'
import { useSettings } from '~/composables/useSettings'
import { useLocalizedData } from '~/composables/useLocalizedData'
const localized = useLocalizedData();
const data = computed(() => localized.value || {}); // fallback to empty object

const { language, nextLanguage, theme, toggleTheme } = useSettings()

console.log("useSettings(): ", useSettings())

const isMobile = useIsMobile();

// const data = useData();

const open = ref(!isMobile.value);
const menuOpen = ref(false);

const scrollTo = useScrollTo();
const route = useRoute();

function isButton(item: any) {
  return item.slug !== 'register';
}

const handleScrollTo = (target: string) => {
  if (route.path === '/') {
    scrollTo(target);
    return;
  }
  Emitter.emit('route-change', `/${target}`);
  menuOpen.value = false; // close on nav
};
</script>

<template>

  <header class="w-[95%] z-50 header backdrop-blur-2xl bg-white/5 rounded-2xl" data-scroll data-scroll-sticky
    data-scroll-target="main">
    <nav class="nav px-4 py-3 pb-3 flex items-center justify-start">
      <button v-if="!isMobile" class="text-nowrap home-link h-6 px-2" @click="handleScrollTo('#hero')">
        <span v-if="language == 'en'"> Imm<span class="text-purple-200">Unity</span> Horizons</span>
        <span v-if="language == 'fa'"> گستره‌ی<span class="text-purple-200"> ایمنی</span></span>
      </button>


      <div class="flex items-center  w-full justify-between gap-2">
        <!-- Language Switcher -->
        <button @click="nextLanguage"
          class="w-8 h-8 rounded-xl text-white bg-white/20 flex items-center justify-center hover:bg-gray-200 hover:text-black"
          :aria-label="`Switch language (current: ${language.toUpperCase()})`">
          {{ language == "fa" ? 'فا' : language.toUpperCase() }}
        </button>

        <!-- Theme Toggle -->
        <button @click="toggleTheme"
          class="w-8 h-8 rounded-xl  text-white bg-white/20 flex items-center justify-center text-gray-700 hover:bg-gray-200"
          :aria-label="`Switch theme (current: ${theme})`">
          <span v-if="theme === 'light'" class=" my-auto">
            <Icon class="w-6 h-6 mt-1 text-yellow-500" name="material-symbols:light-mode" />
          </span>
          <span v-else>
            <Icon class="w-6 h-6 mt-1 text-blue-500" name="material-symbols:dark-mode" />
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


      <!-- Mobile Menu -->
      <teleport to="body">
        <transition name="slide-fade">
          <ul v-if="menuOpen && isMobile"
            class="fixed top-22 right-5 z-[1000] bg-black/30 backdrop-blur-md rounded-3xl p-4 w-max h-max flex flex-col gap-2  text-white">
            <li v-for="item in data.navbar" :key="item.slug"
              class="text-lg font-bold hover:bg-gray/10 w-max active:scale-90 transition-all transform-center rounded-xl px-3 py-1 hover:text-purple-300">
              <button v-if="isButton(item)" @click="handleScrollTo(`#${item.slug}`)">
                {{ item.name }}
              </button>
              <NuxtLink v-else :href="`/${item.slug}`" @click="menuOpen = false">
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </transition>
      </teleport>

      <div class="flex-grow"></div>

      <!-- Desktop Menu -->
      <ul class="text-nowrap h-6 list mt-1" v-if="!isMobile">
        <li v-for="item in data.navbar" :key="item.slug"
          class="hover:bg-gray-200/30 !cursor-pointer transition-all duration-200 px-2 py-2 rounded-xl  link">
          <div v-if="isButton(item)" class="" @click="handleScrollTo(`#${item.slug}`)">
            {{ item.name }}
          </div>
          <NuxtLink v-else class="" :href="`/${item.slug}`">
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
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
  top: 2rem;
  // mix-blend-mode: difference;
  z-index: 999;
  animation: appear 2s variables.$ease-in-out;


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