<script setup lang="ts">
const config = useRuntimeConfig();
const scrollTo = useScrollTo();
const route = useRoute();

const handleScrollTo = (target: string) => {
  if (route.path === '/') {
    scrollTo(target);
    return;
  }

  navigateTo(`/${target}`);
};
</script>

<template>
  <NuxtLayout name="section">
    <footer class="!gap-2 footer">
      <!-- <SpotifyListening /> -->
      <nav class="links-list">
        <!-- <ul class="list">
          <li>
            <button class="button" @click="handleScrollTo('#portfolio')">
              Portfolio
            </button>
          </li>
          <li>
            <button class="button" @click="handleScrollTo('#about')">
              About
            </button>
          </li>
          <li>
            <button class="button" @click="handleScrollTo('#contact')">
              Contact
            </button>
          </li>
        </ul> -->
        <!-- <ul class="list">
          <li>
            <a
              class="button"
              :href="config.public.githubLink"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              class="button"
              :href="config.public.linkedinLink"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <CopyButton :to-copy="config.public.email">
              {{ config.public.email }}
            </CopyButton>
          </li>
        </ul>-->
      </nav>
      <p class="font-mono text-[10px] md:text-[14px] text-left md:text-center text-gray/80">
        © Copyright 2025 - All rights reserved, ImmUnity Horizon
      </p>
      <div class="text-left md:text-center justify-center flex flex-row font-mono  text-gray/80"><small
          class="leading-[15px] love ">Made with </small>
        <Icon class="bg-red w-6 h-[15px]" name="nrk:heart-active" /><small class="leading-[15px] "> by <span
            class=" border-teal/80 border-0 border-b-1 border-solid"> <a class="text-teal/80"
              href="https://github.com/mmshooreshi" target="_blank">mmti
              <Icon name="mdi:robot-love" />
            </a></span></small>
      </div>

    </footer>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.footer {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding-bottom: 2rem;

  @include screens.laptop {
    gap: 6rem;
    padding-bottom: 4rem;
  }

  .title {
    @include typography.heading-3;

    text-align: center;
  }

  .links-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);

    @include screens.laptop {
      grid-template-columns: repeat(2, 16rem);
      gap: 2rem;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .button {
        color: variables.$grey;
        transition: color 0.3s ease-in-out;

        &:hover {
          color: variables.$white;
        }
      }
    }
  }

  .copyright {
    color: variables.$grey;
    text-align: center;

  }
}
</style>
