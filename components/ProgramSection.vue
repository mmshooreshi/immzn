<script setup lang="ts">
import { defineProps, reactive } from 'vue'
import { toPersianDigits } from '~/utils/digits'
const contentRefs = ref<Record<number, HTMLElement | null>>({})
const currentOpenDay = ref<number | null>(null)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
const toggleButtonRefs = ref<Record<number, HTMLElement | null>>({})
const isMobile = useIsMobile()
import { useSettings } from '~/composables/useSettings'

const { language } = useSettings()

function expandEnter(el: HTMLElement) {
  el.style.height = '0'
  el.style.overflowY = 'hidden'
  nextTick(() => {
    el.style.transition = 'height 0.3s ease'
    el.style.height = el.scrollHeight + 'px'
  })
}

function expandAfterEnter(el: HTMLElement) {
  el.style.height = 'auto'
  el.style.overflowY = 'visible' // ✅ Explicitly set it back
}

function expandLeave(el: HTMLElement) {
  el.style.height = el.scrollHeight + 'px'
  el.style.overflowY = 'hidden'
  void el.offsetHeight // force reflow
  el.style.transition = 'height 0.3s ease'
  el.style.height = '0'
}

function expandAfterLeave(el: HTMLElement) {
  el.style.height = ''
  el.style.overflowY = 'visible' // ✅ Restore again
}
function beforeExpand(el: HTMLElement) {
  el.style.display = 'block'
}

function beforeCollapse(el: HTMLElement) {
  el.style.display = 'block'
}

function getClockIconName(session) {
  const hour = parseInt(session.time.end.split(':')[0], 10) % 12 || 12
  return `wi:time-${hour}`
}

defineProps<{
  program: {
    headline: { en: string; fa: string }
    schedule: Array<any>
  }
}>()



// Track open state for each day
const state = reactive({
  openDays: {} as Record<number, boolean>
})

const toggleDay = (id: number) => {
  const alreadyOpen = state.openDays[id]
  for (const key in state.openDays) {
    state.openDays[key] = false
  }
  state.openDays[id] = !alreadyOpen
}


// Compute status classes
const statusClass = (session: any) => {
  const st = session.speaker?.status || session.status || ''
  if (st === 'Confirmed') return 'bg-green-100 text-green-800'
  if (st.startsWith('*')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const dayId = Number((entry.target as HTMLElement).dataset.dayId)
        if (!entry.isIntersecting && state.openDays[dayId]) {
          state.openDays[dayId] = false
        }
      })
    },
    { threshold: 0.01 } // triggers if element is nearly out of view
  )

  nextTick(() => {
    program.schedule.forEach((day) => {
      const el = contentRefs.value[day.id]
      if (el) {
        el.dataset.dayId = String(day.id)
        observer.observe(el)
      }
    })
  })
})

</script>

<template>
  <section id="program" class="py-12 bg-white dark:bg-[#141414]">
    <div class="max-w-3xl mx-auto px-4">
      <h2 class="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        {{ program.headline }}
      </h2>
      <div v-for="day in program.schedule" :key="day.id" class="mb-6">


        <button @click="toggleDay(day.id)" :ref="el => toggleButtonRefs[day.id] = el"
          class="w-full flex justify-between items-center bg-indigo-100 dark:bg-gray-800 px-4 py-3 rounded-lg focus:outline-none">
          <span class="font-semibold text-indigo-700 dark:text-indigo-300">
            {{ day.day }} • {{ day.date }}
          </span>
          <svg :class="{ 'rotate-180': state.openDays[day.id] }" class="w-5 h-5 transform transition-transform"
            viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
          </svg>
        </button>

        <Transition @before-enter="beforeExpand" @enter="expandEnter" @after-enter="expandAfterEnter"
          @before-leave="beforeCollapse" @leave="expandLeave" @after-leave="expandAfterLeave">
          <div v-show="state.openDays[day.id]" :ref="el => contentRefs[day.id] = el"
            class="w-[120%] -mx-[10%] overflow-visible">
            <!-- animated wrapper -->

            <div class="mt-4  overflow-visible mx-[10%] space-y-4 ">
              <div v-motion-slide-visible-top :delay="idx * 50" v-for="(session, idx) in day.sessions"
                :key="session.time.start + session.title"
                class="pb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm relative ">
                <!-- {{ session }} -->
                <template v-if="!session.segments">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-mono text-lime-600 dark:text-lime-200 flex flex-row gap-2 items-center">
                      <!-- {{ session.time.start.split(':')[0] % 12 }} -->
                      <!-- <Icon :name="`wi:time-${session.time.start.split(':')[0] % 12}`" /> -->
                      <Icon class="h-5 w-5" :name="getClockIconName(session)" />


                      <!-- {{ getClockIconName(session) }} -->

                      {{ language == 'fa' ? toPersianDigits(session.time.start) : session.time.start }} - {{
                        language == 'fa' ? toPersianDigits(session.time.end) : session.time.end }}
                      <strong v-if="session.location" class="text-blue mx-1 -mt-1 text-xs">
                        <Icon class="w-4 translate-y-1 -mx-0.5 h-4" name="ep:location-filled" />
                        {{ session.location }}
                      </strong>
                    </span>
                    <!-- <span v-if="session.speaker || session.status"
                      class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(session)">
                      {{ session.speaker?.status || session.status }}
                    </span> -->
                  </div>
                  <h4 class="font-medium dark:text-teal-300 text-sm text-teal-800  -mt-2 mb-6">
                    <Icon class="w-6 text-teal-300 h-6 translate-y-2 mx-0" name="fluent:slide-text-title-20-regular" />
                    {{ session.title }}

                  </h4>
                  <div class="h-2"></div>
                  <p class="text-xs mx-4 my-2" :class="{ 'opacity-30': det[0] == '*' }" v-for="det in session.details">
                    - {{ det }}
                  </p>
                  <div v-if="session.speaker"
                    class="text-xs mx-auto  md:scale-80 w-max transform-origin-center hover:bg-gray-800 text-gray-700 dark:text-gray-300 mb-1 -mt-4  border border-white/40 border-solid rounded-2xl w-max px-2 shadow-lg cursor-pointer md:hover:scale-85 transition-all">
                    <div class="-mt-3 mb-2  w-max">
                      <Icon class="w-8 h-8 translate-y-4 mt-1 mx-1" name="mingcute:user-star-fill" />

                      {{ session.speaker.name }}

                      <span v-if="session.speaker.affiliation">
                        <br />
                        <small class="text-[8px] md:text-[12px]  opacity-50"
                          :class="{ 'ml-10.5': language == 'en', 'mr-10.5': language == 'fa' }">{{
                            session.speaker.affiliation
                          }}</small></span>
                    </div>
                  </div>

                  <p v-if="session.description" class="text-sm text-gray-700 dark:text-gray-400">
                    {{ session.description }}
                  </p>
                  <p v-if="session.notes" class="text-xs italic text-gray-500 dark:text-gray-600 mt-2">
                    {{ session.notes }}
                  </p>
                </template>
                <template v-else>
                  <div v-for="segment in session.segments" class="relative my-4">
                    <!-- {{ segment }} -->
                    <div class=" absolute left-0 mb-2">

                      <!-- <span v-if="segment.speaker || segment.status"
                        class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(segment)">
                        {{ segment.speaker?.status || segment.status }}
                      </span> -->
                    </div>

                    <h4 class="font-medium dark:text-teal-300 text-teal-800 mb-1 flex flex-row items-center">
                      <Icon class="w-5 text-teal-300 h-5  mx-1" name="fluent:slide-text-title-20-regular" />

                      {{ segment.title }} <div v-if="segment.location"
                        class="mx-1 text-xs bg-blue-800 text-white transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer rounded-md px-1 flex flex-row h-min w-min pt-1">
                        <Icon class="w-4 -translate-y-0.5 -mx-0.5 h-4" name="ep:location-filled" />
                        <div class="w-max -translate-y-0.5 my-0 mx-1">{{ segment.location }}</div>
                      </div>

                    </h4>

                    <div v-if="segment.details" class="h-4"></div>
                    <p class="text-xs mx-4 my-2" :class="{ 'opacity-30': det[0] == '*' }"
                      v-for="det in segment.details">
                      {{ det }}
                    </p>
                    <div class="mx-6 mt-2">
                      <p v-if="segment.speaker" class="text-xs text-gray-700 dark:text-gray-300 mb-1 ">
                        <Icon class="w-5 h-5 translate-y-1.5 mx-1" name="mingcute:user-star-fill" />

                        {{ segment.speaker.name }}
                        <span v-if="segment.speaker.affiliation">
                          <span v-if="!isMobile">—</span><small class="text-[9px] opacity-50">{{
                            segment.speaker.affiliation
                          }}</small></span>
                      </p>
                      <p v-if="segment.description" class="text-sm text-gray-700 dark:text-gray-400">
                        {{ segment.description }}
                      </p>
                      <p v-if="segment.notes" class="text-xs italic text-gray-500 dark:text-gray-600 mt-2">
                        {{ segment.notes }}
                      </p>
                    </div>

                  </div>

                </template>

              </div>
            </div>
          </div>
        </Transition>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* .transition-max-height {
  transition-property: max-height;
} */
</style>
