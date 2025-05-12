<script setup lang="ts">
import Emitter from '~~/utils/emitter'
import { useData } from '@/composables/useData'
import { ref, computed, watch } from 'vue'
const isMobile = useIsMobile();

const data = useData();

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
  <header class="w-[95%] z-50 header backdrop-blur-2xl bg-white/5 rounded-2xl" data-scroll data-scroll-sticky data-scroll-target="main">
    <nav class="nav px-4 p-2 pt-3">
      <button class="home-link h-6" @click="handleScrollTo('#hero')">
        Imm<span class="text-purple-200">Unity</span> Horizons
      </button>

      <!-- Hamburger button -->
      <button class="hamburger" @click="menuOpen = !menuOpen" v-if="isMobile">
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
      </button>

      <!-- Mobile Menu -->
      <transition name="slide-fade">
        <ul dir="rtl" v-if="menuOpen && isMobile" class="h-6 mobile-menu bg-[#313131]">
          <li
            v-for="item in data.navbar"
            :key="item.slug"
            class="link hover:text-purple-300 hover:bg-purple-300/30 rounded-lg p-2 w-max border-white hover:border-red"
          >
            <button
              v-if="isButton(item)"
              @click="handleScrollTo(`#${item.slug}`)"
            >
              {{ item.name }}
            </button>
            <NuxtLink
              v-else
              :href="`/${item.slug}`"
              @click="menuOpen = false"
            >
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </transition>

      <!-- Desktop Menu -->
      <ul class="h-6 list mt-1" v-if="!isMobile">
        <li
          v-for="item in data.navbar"
          :key="item.slug"
          class="hover:bg-gray-200/30 !cursor-pointer transition-all duration-200 px-2 py-2 rounded-xl  link"
        >
          <div
            v-if="isButton(item)"
            class=""
            @click="handleScrollTo(`#${item.slug}`)"
          >
            {{ item.name }}
      </div>
          <NuxtLink
            v-else
            class=""
            :href="`/${item.slug}`"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped lang="scss">
@keyframes appear {
  0%, 50% { opacity: 0; }
  100% { opacity: 1; }
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
  mix-blend-mode: difference;
  z-index: 999;
  animation: appear 2s variables.$ease-in-out;

  .nav {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

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
          transform: rotate(45deg) translateY(11px);
        }
        &.open:nth-child(2) {
          opacity: 0;
        }
        &.open:nth-child(3) {
          transform: rotate(-45deg) translateY(-11px);
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