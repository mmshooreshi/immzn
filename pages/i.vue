<script setup lang="ts">
import { onMounted } from 'vue'
import { useDataStore } from '~/stores/dataStore'

const dataStore = useDataStore()

onMounted(async () => {
  await dataStore.loadData()
})
</script>

<template>
  <div class="min-h-screen p-6 font-sans">
    <h1 class="text-3xl font-bold mb-4">Data Store Test</h1>

    <div v-if="dataStore.loading" class="text-blue-600">Loading data from GitHub...</div>
    <div v-else-if="dataStore.error" class="text-red-600">Error: {{ dataStore.error }}</div>
    <div v-else-if="dataStore.data">
      <h2 class="text-xl font-semibold mb-2">Data loaded successfully!</h2>
      <p>Last SHA (fake): {{ dataStore.lastSha }}</p>

      <pre class="text-black"
        style="max-height:400px; overflow:auto; background:#f3f3f3; padding:1rem; border-radius:0.5rem;">
        {{ JSON.stringify(dataStore.data, null, 2) }}
      </pre>
    </div>
    <div v-else>
      No data available.
    </div>
  </div>
</template>
