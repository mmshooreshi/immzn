<!-- components/HomeHeroSection.vue -->
<script setup lang="ts">
import Tree from '@/components/Tree.vue'
import B3DLoader from '~/components/B3DLoader.vue'
import { useSettings } from '~/composables/useSettings'

const { language } = useSettings()


const isMobile = useIsMobile();

import { useSplitTextSequence } from '@/composables/useSplitTextMotion'
const config = useRuntimeConfig();
const props = defineProps<{ data: any }>()



const hero = ref<HTMLElement | null>(null)

const { animate, cleanup } = useSplitTextSequence(hero, {
  selector: '.sequence-item',   // defaults to this
  type: 'words',
  containerVars: { opacity: 0, y: 40, duration: 0.7, ease: 'expo.out' },
  fromVars: { opacity: 0, y: 15, stagger: 0.1, duration: 0.5, ease: 'expo.out' },
  elementDelay: 0.8                  // 0.8s pause between each item
})

onMounted(animate)
onBeforeUnmount(cleanup)


</script>

<template>


  <section ref="hero" id="hero" class="container mx-auto">

    <!-- purely static heading, animated by GSAP/SplitText -->
    <h1 class="sequence-item heading-1 text-center max-w-screen-md mx-auto z-1 pointer-events-none ">
      <!-- mix-blend-difference -->
      <span>{{ data?.title?.first }}</span>
      <strong class="nf">{{ data?.title?.second }}</strong><br />
      <span>{{ data?.title?.third }}</span><br />
    </h1>

    <!-- purely static subheading -->

    <h2
      class="sequence-item taglineC z-1 text-md text-[12px]  p-2 px-4  rounded-2xl md:text-xl   w-max max-w-[80vw]   text-teal-100 mx-8  leading-[1.5]"
      :class="{ 'text-left': language == 'en', 'text-right': language == 'fa' }">
      <span class="text-white/80 text-xs" :class="{ 'mr-1': language == 'en', 'ml-1': language == 'fa' }">{{
        data?.tagline?.first
        }}</span>

      <span class="">{{ data?.tagline?.second }}</span>
      <span class="">{{ data?.tagline?.third }}</span>
      <span class="">{{ data?.tagline?.fourth }}</span>

      <br>
      <span class="text-xs text-purple tracking-0">{{ data?.dates }}</span>


    </h2>



    <div class="sequence-item scroll-guide">
      <img class="arrow" src="/icons/arrow.svg" alt="" width="24" height="24" />

      <span v-if="language == 'en'">Scroll</span>
      <span v-if="language == 'fa'"></span>

    </div>
    <div class="sequence-item button-container">
      <IconButton class="button" icon-src="/icons/telegram-logo.svg" :href="config.public.telegramChannelLink">
        <span v-if="language == 'en'">Check out our Channel</span>
        <span v-if="language == 'fa'">ما را دنبال کنید</span>

      </IconButton>
    </div>
    <!-- <CubeBackground /> -->
    <div ref="b3d" class="b3d-wrapper">
      <B3DLoader />
    </div>
  </section>
</template>

<style scoped lang="scss">
@keyframes arrow {
  0% {
    translate: 0 -0.3rem;
  }

  50% {
    translate: 0 0.3rem;
  }

  100% {
    translate: 0 -0.3rem;
  }
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100vw;
  height: 100vh;

  @supports (height: 100svh) {
    height: 100svh;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    // background-color: variables.$dark;
    background-color: #141414;
  }

  .heading-1 {
    @include typography.heading-1;
  }

  .nf {
    @include mixins.text-stroke;
  }

  .hero {
    @include typography.heading-1;

    text-align: center;
    max-width: 24rem;
    z-index: 1;
    pointer-events: none;
    // mix-blend-mode: difference;
    translate: 0 6rem;

    @include screens.laptop {
      max-width: 64rem;
      translate: 0;
    }

    @include screens.desktop {
      max-width: 80rem;
    }

    .filled {
      // @include animations.appear;
    }

    :not(.filled) {
      @include mixins.text-stroke;
      // @include animations.appear-with-delay;

      @include screens.laptop {
        @include mixins.text-stroke(variables.$white);
      }
    }
  }


  .scroll-guide {
    // @include animations.appear-with-delay;

    position: absolute;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    z-index: 1;

    @include screens.laptop {
      left: auto;
      right: auto;
    }

    [data-lang='fa'] & {
      right: 1.5rem;

    }

    [data-lang='en'] & {
      left: 1.5rem;

    }

    .arrow {
      animation: arrow 2s infinite variables.$ease-in-out;
    }
  }

  .button-container {
    @include mixins.mobile-padding;
    @include mixins.section-width;
    // @include animations.appear-with-delay;

    position: absolute;
    bottom: 2rem;
    display: flex;
    justify-content: flex-end;
    z-index: 1;
  }
}



.taglineC {

  [data-lang='fa'] & {
    letter-spacing: 0px;
    margin-top: -32px;
  }

  [data-lang='en'] & {
    letter-spacing: 5px;
    margin-top: 32px;
  }
}
</style>
