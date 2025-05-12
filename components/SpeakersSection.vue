<template>
    <section id="speakers" class="py-12 ">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-10">Speakers</h2>
  
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <article
            v-for="speaker in speakers"
            :key="speaker.id"
            class="relative flex flex-col bg-white/10 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div class="p-6 flex-1 flex flex-col">
              <h3 class="text-xl font-semibold mb-1">{{ speaker.name.en }}</h3>
  
              <p v-if="speaker.role?.en" class="text-sm text-indigo-600 mb-2">
                {{ speaker.role.en }}
              </p>
  
              <p class="text-sm text-gray-500 mb-4">
                {{ speaker.affiliation.en }}
              </p>
  
              <p class="text-sm text-teal-700 line-clamp-3">
                {{ speaker.bio.en }}
              </p>
            </div>
  

            <span
              v-if="speaker.confirmed"
              class="absolute top-4 right-4 inline-flex items-center"
            >
            <Icon name="material-symbols:check-circle-outline-rounded" class="w-8 h-8" style="color: #42ffd9" />

            </span>
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
  
  defineProps({
    speakers: {
      type: Array as PropType<Speaker[]>,
      required: true,
    },
  })
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
  