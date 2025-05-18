<!-- components/HomeAbout.vue -->
<script setup lang="ts">
const isMobile = useIsMobile();
// import { useData } from '@/composables/useData'
// const data = useData()

const props = defineProps<{
  data: {
    headline: string
    description: string
    image: string
    altText: string
    scheduleDays: Array<{ label: string; bullets: string[] }>
  }
}>()


// const scheduleDays = computed(() => props.data.scheduleDays || [])
const descriptionHtml = computed(() => props.data?.description?.split('\n').join('<br/>') ?? '')
const descriptionHtmlKey = ref()
descriptionHtmlKey.value = descriptionHtml.value[0]
// console.log("aaaaa", props.data)
// const scheduleDays = computed(() => data['3_scheduleTeaser'].days || [])
</script>





<template>
  <!-- {{ data }} -->
  <NuxtLayout name="section">

    <SkillsContainer />
    <figure id="about" class="figure">
      <figcaption v-if="isMobile">
        <h2 class="hero">{{ data?.headline }} <span class="empty"></span></h2>
      </figcaption>
      <img class="image object-cover" src="~/public/images/event.webp" alt="" width="256" height="384" loading="lazy" />
      <figcaption class="figcaption">
        <h2 v-if="!isMobile" class="hero">
          {{ data?.headline }} <span class="empty"></span>
        </h2>


        <p v-if="descriptionHtmlKey != '*'" v-html="descriptionHtml" class=" max-w-lg paragraph mt-2"></p>

      </figcaption>
    </figure>

    <ul v-if="data?.scheduleDays?.length" class="list md:w-max  lg:-translate-y-12 -z-5" data-scroll
      data-scroll-class="visible" data-scroll-repeat="true" :data-scroll-offset="isMobile ? '0' : '25%'">
      <li class="timeline " />
      <li v-for="(day, index) in data?.scheduleDays" :key="index" class="list-item">
        <span class="circle" />
        <div class="content">
          <h3 class="title">{{ day.label }} </h3>
          <p v-for="(bullet, i) in day.bullets" :key="i" class="description max-w-[500px] text-md leading-normal">
            {{ bullet }}
          </p>
        </div>
      </li>
    </ul>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.figure {
  @include mixins.section;

  padding: 0;
  width: min(100%, 55rem);

  @include screens.laptop {
    flex-direction: row;

    .figcaption {
      display: flex;
      flex-direction: column;
      gap: 4rem;

      .hero {
        white-space: nowrap;
      }
    }
  }

  .hero {
    @include typography.heading-2;

    .empty {
      @include mixins.text-stroke;
    }
  }

  .image {
    border-radius: 99rem;
  }

  .paragraph {
    @include typography.paragraph;

    color: variables.$grey;


    strong {
      color: variables.$white;
    }


    .blink {
      @include mixins.blink;
    }
  }


}

.list {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  position: relative;

  @include screens.laptop {
    [data-lang='en'] & {
      gap: 3rem;
      right: 2.5rem;
      // margin-left: -19%;

    }

    [data-lang='fa'] & {
      gap: 3rem;
      left: 2.5rem;
      // margin-right: -17%;


    }
  }

  .timeline {
    position: absolute;
    top: 2rem;
    bottom: 2rem;

    width: 2px;
    background-image: linear-gradient(to bottom,
        variables.$blue,
        variables.$green );
    z-index: -1;
    clip-path: inset(0 0 100% 0);
    transition: clip-path 1.5s variables.$ease-in-out;

    [data-lang='en'] & {
      left: calc(1rem - 1px);
    }

    [data-lang='fa'] & {
      right: calc(1rem - 1px);

    }

    @include screens.laptop {
      [data-lang='en'] & {
        left: calc(1.5rem - 1px);
        top: -6rem;
      }

      [data-lang='fa'] & {
        right: calc(1.5rem - 1px);
        top: -6rem;
      }
    }
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;

    @include screens.laptop {
      gap: 3rem;
    }

    .circle {
      flex: 0 0 auto;
      width: 2rem;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      background-color: variables.$dark;
      border: 2px solid variables.$white;
      scale: 0;
      transition: scale 0.5s 0.25s variables.$ease-in-out;

      @include screens.laptop {
        width: 3rem;
      }

      &.full {
        background-color: variables.$white;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0;
      translate: 0 1rem;
      transition: 0.5s 0.25s variables.$ease-in-out;

      .title {
        @include typography.heading-3;
      }

      .sub {
        color: variables.$grey;
      }
    }

    &:nth-of-type(2) * {
      transition-delay: 0.5s;
    }

    &:nth-of-type(3) * {
      transition-delay: 0.75s;
    }

    &:nth-of-type(4) * {
      transition-delay: 1s;
    }

    &:nth-last-of-type(1) .circle {
      background-color: variables.$white;
    }
  }

  &.visible {
    .timeline {
      clip-path: inset(0);
    }

    .list-item {
      .circle {
        scale: 1;
      }

      .content {
        translate: 0;
        opacity: 1;
      }
    }
  }
}
</style>
