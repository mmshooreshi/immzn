<template>

  <section id="speakers" class="py-12 ">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-10"> {{headline?.find(item => item.slug === "speakers")?.name ||
        'Speakers'}} </h2>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <article v-for="speaker in speakers" :key="speaker.id"
          class="relative flex flex-col bg-white/10 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <div class="p-6 flex-1 flex flex-col">
            <span v-if="speaker.confirmed" class="flex">
              <Icon name="material-symbols:check-circle-outline-rounded" class="w-6 h-6 min-w-6 mr-2"
                style="color: #42ffd9" />
              <h3 class="text-lg font-semibold mb-1 mr-4">
                {{ speaker.name }}</h3>
            </span>

            <p v-if="speaker.role" class="text-sm text-indigo-600 mb-2">
              {{ speaker.role }}
            </p>

            <p class="text-sm text-gray-500 mb-4">
              {{ speaker.affiliation }}
            </p>

            <p class="text-sm text-teal-700 line-clamp-3">
              {{ speaker.bio }}
            </p>
          </div>




        </article>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>

interface LocalizedString {
  en: string
  fa?: string
}

interface Speaker {
  id: string
  name: LocalizedString
  role?: LocalizedString
  affiliation: LocalizedString
  bio: LocalizedString
  confirmed: boolean
}

interface HeadlineItem {
  slug: string
  name: string
}

const props = defineProps({
  speakers: {
    type: Array as PropType<Speaker[]>,
    required: true,
  },
  headline: {
    type: Array as PropType<HeadlineItem[]>,
    required: true,
  },
})


console.log('headline:', props.headline)

</script>

<style scoped>
/* If you don\'t have the Tailwind CSS line‑clamp plugin, this fallback keeps bios tidy */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>