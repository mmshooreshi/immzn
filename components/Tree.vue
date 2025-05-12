<template>

<teleport to="body">
    <div class="absolute z-500">
    <button @click="showModal = true">Edit JSON</button>
    <DataEditorModal v-if="showModal" :data="data" @close="showModal = false" />
    </div>
    </teleport>
    
</template>

<script setup lang="ts">
import {useData} from '@/composables/useData';
import DataEditorModal from '@/components/DataEditorModal.vue'
const  data  = useData()
const showModal = ref(false)
</script>


