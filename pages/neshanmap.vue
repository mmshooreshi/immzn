<!-- pages/neshanmap.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import SimpleNeshanMap from '~/components/SimpleNeshanMap.client.vue'


import { useSettings } from '~/composables/useSettings'
import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'
const { localizedData, loading } = storeToRefs(useDataStore())
const { language } = useSettings()


// 2️⃣: your API key
const apiKey = 'web.624bf8560ef44688b1b1d971027b361c'

// 3️⃣: derive the initial center & zoom
const initialCenter = computed<[number, number]>(
  () => localizedData.value.map.mapConfig.center as [number, number]
)
const initialZoom = computed<number>(
  () => localizedData.value.map.mapConfig.zoom
)

// 4️⃣: build your marker array from tabs that have `marker`
const markers = computed(() => {
  return localizedData.value.map.tabs
    .filter(tab => 'marker' in tab)
    .map(tab => {
      const m = (tab as any).marker
      return {
        coords: m.coords as [number, number],
        // use whichever language you prefer here:
        label: m.coords as [string, string],
        svg: '/icons/ipm.svg',
        popupHtml: (m.popupHtml as any) as string
      }
    })
})
</script>

<template>
  <NuxtLayout name="page">
    <!-- force a full-viewport height here -->
    <div class="flex flex-col items-center w-max bg-red h-max mt-28 mx-auto my-auto">
      <SimpleNeshanMap :apiKey="apiKey" :markers="markers" :initialCenter="initialCenter" :initialZoom="initialZoom" />
    </div>
  </NuxtLayout>
</template>

<style>
html,
body,
#__nuxt,
#n-app {
  height: 100%;
}
</style>