<!-- /pages/neshanmap.vue -->
<template>
  <NuxtLayout name="page">
    <DataEditorModal v-if="showModal" :data="data" @close="showModal = false" />

    <div class="max-w-screen-lg mx-auto my-8">
      <!-- Tab selector -->
      <div class="flex space-x-4 border-b mb-4">
        <button v-for="tab in tabList" :key="tab.id" @click="activeTab = tab.id"
          :class="['px-4 py-2 -mb-px', activeTab === tab.id ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600']">
          {{ tab.label }}
        </button>
      </div>

      <!-- Map -->
      <client-only>
        <SimpleNeshanMap :key="activeTab" :apiKey="apiKey" :markers="visibleMarkers" :routes="visibleRoutes"
          :initialCenter="initialCenter" :initialZoom="initialZoom" />
      </client-only>

      <!-- JSON debug -->
      <JsonViewer :data="{ markers: visibleMarkers, routes: visibleRoutes }" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SimpleNeshanMap from '~/components/SimpleNeshanMap.client.vue'
import JsonViewer from '@/components/JsonViewer.vue'
import { useSettings } from '~/composables/useSettings'
import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'

const { localizedData } = storeToRefs(useDataStore())
const { language } = useSettings()
const apiKey = 'web.624bf8560ef44688b1b1d971027b361c'

// root data
const data = computed(() => localizedData.value.map)
const showModal = ref(true)
// tabs: IPM marker + each route
const tabList = computed(() => {
  const base = [{ id: 'marker', label: data.value.headline }]
  const routes = data.value.routes.map(r => ({ id: r.id, label: r.description }))
  return base.concat(routes)
})

const activeTab = ref('marker')

// center & zoom
const initialCenter = computed(() => data.value.mapConfig.center as [number, number])
const initialZoom = computed(() => data.value.mapConfig.zoom)

// derive visible markers & routes
const visibleMarkers = computed(() => {
  if (activeTab.value === 'marker') {
    return [data.value.marker]
  }
  const route = data.value.routes.find(r => r.id === activeTab.value)
  if (!route) return []
  // show origin marker and IPM marker
  return [
    { coords: route.origin as [number, number], popupHtml: route.originPopupHtml, svg: '/icons/' + route.type + '.svg', label: route.originPopupHtml },
    data.value.marker
  ]
})

const visibleRoutes = computed(() => {
  if (activeTab.value === 'marker') return []
  const route = data.value.routes.find(r => r.id === activeTab.value)
  return route ? [route] : []
})
</script>

<style>
html,
body,
#__nuxt,
#n-app {
  height: 100%;
}

button {
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>