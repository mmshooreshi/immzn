<!-- pages/index.vue -->
<script setup lang="ts">
// import { useData } from '@/composables/useData'
import JsonViewer from '@/components/JsonViewer.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
// import Map from '~/components/Map.vue'
import Mapbx from '~/components/Mapbx.vue'


import { useSettings } from '~/composables/useSettings'
import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'
const { localizedData, loading } = storeToRefs(useDataStore())
const { language } = useSettings()


</script>

<template>

  <NuxtLayout name="page">
    <LoadingOverlay :show="loading" />


    <!-- <MarkerIcon class="absolute top-[48%] left-[48%] z-10" /> -->
    <!-- <div class=" w-screen h-100 z-100 bg-red">
      <MapboxMap map-id="{ID}" style="width: 100%; height: 100%;" :options="{
        style: 'mapbox://styles/mapbox/light-v11', // style URL
        center: [-68.137343, 45.137451], // starting position
        zoom: 5 // starting zoom
      }" />
    </div> -->
    {{ localizedData.map }}
    <ClientOnly>
      <Mapbx :mapData="localizedData.map" lang="fa" />
    </ClientOnly>

    <BaseFooter />
  </NuxtLayout>


</template>
