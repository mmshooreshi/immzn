<script setup>
import { useWizardStore } from '~/stores/wizard'
const { profile, next } = useWizardStore()

definePageMeta({ middleware: ['auth'] })
</script>

<template>
    <NuxtLayout name="wizard">
        <form @submit.prevent="next" class="w-80 space-y-4">
            <input v-model="profile.name" class="w-full p-2 border rounded" placeholder="Full name" required>
            <input v-model="profile.email" class="w-full p-2 border rounded" placeholder="E-mail" required>
            <button class="w-full p-2 bg-blue-600 text-white rounded">Next</button>
        </form>
    </NuxtLayout>
</template>
