<template>
  <section
    class=" h-screen w-full overflow-hidden bg-white dark:bg-gray-800 py-8 pt-20 lg:pt-30 px-4 sm:px-6  lg:px-8 leading-7"
    v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.5 } } }">
    <!-- Decorative background shapes -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div
        class="absolute top-[-60%] md:top-[-10%] left-[80%] md:left-[-30%] w-[120%] md:w-[90%] h-[120%] bg-gradient-to-br from-teal-400 to-blue-500 opacity-20 rounded-full transform rotate-75 md:rotate-45">
      </div>
      <div
        class="absolute bottom-[-80%] md:bottom-[-40%] right-[0%] md:right-[-30%] w-[130%] md:w-[70%] h-[100%] bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-15 rounded-full transform -rotate-20 md:rotate-12">
      </div>
    </div>


    <div class="flex flex-col md:grid md:grid-cols-5 mx-auto">
      <div class=" md:col-span-3 md:-mx-8 ">
        <div
          class="flex max-w-2xl flex-row group md:m-8 mt-2 rounded-3xl py-0  pt-0 px-4 hover:bg-blue/20 cursor-pointer hover:-translate-y-2 transition-all ">
          <Icon name="mdi:rocket-launch"
            :class="[language == 'fa' ? '-rotate-70 group-hover:-rotate-100' : 'group-hover:rotate-30 -rotate-20']"
            class="transition-all duration-700  h-24 w-30 text-teal-500 mx-0" />
          <h1
            class="leading-6  mx-4 md:mx-4 -mt-2 scale-95 transition-all duration-500 group-hover:scale-100 flex items-center text-xl  md:text-2xl font-extrabold text-gray-900 dark:text-white">
            {{ interpolate(data.message.intro) }}
          </h1>


        </div>

      </div>

      <div class="flex  md:col-span-2 md:-mx-8">
        <p
          class="sm:mt-4 mx-1 sm:mx-8 md:mx-2  flex gap-4 hover:text-teal-500   hover:gap-2   transition-all rounded-lg  border-white/20 w-min px-2  items-center justify-center text-xs md:text-sm font-medium text-gray-900 dark:text-white">
          <Icon :name="language == 'en' ? 'mdi:hand-pointing-right' : 'mdi:hand-pointing-left'"
            class="h-6 w-6 text-teal-500 " />
          {{ data.message.ctaPrompt }}
        </p>

        <div class="sm:mt-4 flex flex-row items-center gap-0 mx-0 w-max sm:justify-center">
          <NuxtLink :to="data.message.buttons.accept.link"
            class="inline-flex items-center justify-center gap-2  px-2 py-1 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition">
            <Icon name="mdi:check-circle" class="h-5 w-5" />
            <span>{{ data.message.buttons.accept.label }}</span>
          </NuxtLink>

          <button @click="() => eval(data.message.buttons.reject.action)"
            class="inline-flex items-center scale-80 justify-center gap-2 px-2 py-1 rounded-full border border-gray-400 hover:bg-red-400/50 dark:hover:bg-red-500/50 text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition">
            <Icon name="mdi:close-circle" class="h-5 w-5 " />
            <span>{{ data.message.buttons.reject.label }}</span>
          </button>
        </div>

      </div>

    </div>

    <div class="sm:mt-10 mt-4 mx-auto max-w-4xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-6 md:items-start"
      :class="[language === 'fa' ? 'rtl text-right' : 'ltr text-left']">

      <!-- Content Column -->
      <div class=" md:col-span-4">

        <div class="mt-0 px-2 gap-4 flex flex-col text-gray-700 dark:text-gray-200 text-xs md:text-sm">
          <div class="flex items-start">
            <div class="w-18 h-8 mx-2">
              <Icon name="mdi:calendar-range" class="w-full h-full text-gray-500" />
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
              {{ data.meta.description }}
            </p>
          </div>

          <div class="flex items-start">
            <div class="w-16 h-8 mx-2">
              <Icon name="mdi:clock-outline" class="w-full h-full text-teal-600" />
            </div>
            <p class="text-teal-800 dark:text-teal-200">

              {{ data.message.eventOverview }}
            </p>
          </div>

          <div class="flex items-start ">
            <div class="w-24 h-8 mx-2">
              <Icon name="mdi:code-tags" class="w-full h-full text-indigo-500" />
            </div>
            <p class="text-indigo-800 dark:text-indigo-200">
              {{ data.message.hackathonPitch }}
            </p>
          </div>


          <div class="flex items-start mt-8">
            <div class="w-6 mx-2 h-7">
              <Icon name="mdi-domain" class="w-full h-full text-purple-500" />
            </div>
            <p class=" italic my-auto">

              {{ data.message.organisedBy }}
            </p>
          </div>

        </div>

        <ul class="mt-2 mx-2 text-xs md:text-sm space-y-1">
          <li v-for="(item, idx) in data.message.highlights" :key="idx"
            class="flex items-center text-gray-700  hover:text-black hover:mx-2 transition-all  dark:text-gray-200/50 dark:hover:text-white  ">
            <Icon :name="language == 'en' ? 'mdi:chevron-right' : 'mdi:chevron-left'"
              class="h-5 w-5 text-teal-500 mr-2" />
            {{ item }}
          </li>
        </ul>

      </div>
      <div :class="[language == 'fa' ? 'left-4 transform-origin-bottom-left' : 'right-4 transform-origin-bottom-right']"
        class="group scale-40 absolute  bottom-2  transform-origin-bottom-left md:relative sm:scale-80 md:scale-100 block  -mt-8  opacity-20 sm:opacity-50 hover:opacity-100 transition-all md:col-span-2">
        <slot name="illustration">
          <div class=" w-full h-84  rounded-lg flex items-center justify-center">
            <div class="avatar w-max h-full">
              <Icon name="arcticons:marvel-contest-of-champions"
                class="transition-all duration-500 group-hover:scale-120 group-hover:-rotate-10  rotate-5  w-80 h-full  text-indigo-700 dark:text-gray-400" />
            </div>
          </div>
        </slot>
      </div>


      <!-- Illustration Slot for Desktop -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSettings } from '~/composables/useSettings'
import { useAuth } from '~/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps<{ data: any }>()
const { language } = useSettings()
const auth = useAuth()
const router = useRouter()

// Helper to inject inviter name
const interpolate = (str: string) => str.replace('{inviter}', '<inviter name>')
</script>


<style scoped>
.avatar {
  /* overflow: hidden; */
  /* box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6); */
  transform: translatey(0px);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    /* drop-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.3); */
    filter: drop-shadow(0px 10px 3px rgba(0, 0, 0, 0.3));
    transform: translatey(0px) scale(0.8) rotate(0deg);
  }

  50% {
    /* drop-shadow: 0 25px 15px 0px rgba(0, 0, 0, 0.05); */
    filter: drop-shadow(0px 10px 20px rgba(0, 0, 0, 0.3));
    transform: translatey(-20px) scale(1) rotate(5deg);
  }

  100% {
    /* drop-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.3); */
    filter: drop-shadow(0px 10px 3px rgba(0, 0, 0, 0.3));
    transform: translatey(0px) scale(0.8) rotate(0deg);
  }
}
</style>