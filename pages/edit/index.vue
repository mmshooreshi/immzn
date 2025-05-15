<!-- /pages/edit/index.vue  -->
<template>
    <div class=" min-h-screen bg-gray-100 p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">📄 JSON Files</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink v-for="file in files" :key="file" :to="`/edit/${file}`"
                class="block p-6 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition">
                {{ file }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const files = ref([] as string[])

onMounted(async () => {
    files.value = await $fetch('/api/files')
})
</script>
