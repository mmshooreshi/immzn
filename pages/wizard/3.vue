<script setup>
import { useWizardStore } from '~/stores/wizard'
const { paid, prev } = useWizardStore()
function pay() { setTimeout(() => (paid.value = true), 600) }  // mock gateway

definePageMeta({ middleware: ['auth'] })

</script>

<template>
    <NuxtLayout name="wizard">
        <div class="w-80 space-y-6 text-center">
            <p>One-time fee: <b>€25</b></p>

            <button v-if="!paid" @click="pay" class="w-full p-2 bg-green-600 text-white rounded">
                Pay now
            </button>
            <p v-else class="text-green-600">✅ Payment received</p>

            <button @click="prev" class="text-sm underline text-gray-400">Back</button>
        </div>
    </NuxtLayout>
</template>
