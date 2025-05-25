<script setup>
import { ref } from 'vue'
import { useWizardStore } from '~/stores/wizard'
const { cvFile, prev, next } = useWizardStore()
const tmp = ref < File | null > (null)
function go() { if (tmp.value) { cvFile.value = tmp.value; next() } }

definePageMeta({ middleware: ['auth'] })

</script>

<template>
    <NuxtLayout name="wizard">
        <div class="w-80 space-y-4">
            <input type="file" accept=".pdf,.doc,.docx" @change="e => tmp = e.target.files?.[0] || null">
            <div class="flex justify-between">
                <button @click="prev" class="border rounded px-4 py-2">Back</button>
                <button :disabled="!tmp" @click="go"
                    class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>
    </NuxtLayout>
</template>
