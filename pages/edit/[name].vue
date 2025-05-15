<!-- pages/edit/[name].vue -->
<template>
    <div class="min-h-screen bg-gray-100 p-6  h-screen overflow-scroll">
        <button @click="$router.push('/edit')"
            class="mb-4 inline-flex items-center text-sm text-gray-700 hover:text-gray-900">
            ← Back
        </button>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit: {{ name }}</h1>

        <nav class="flex space-x-4 border-b border-gray-300 mb-6">
            <button v-for="tab in tabs" :key="tab" @click="currentTab = tab" :class="[
                'pb-2 px-2',
                currentTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900'
            ]">
                {{ tab }}
            </button>
        </nav>

        <transition name="fade" mode="out-in">
            <div :key="currentTab">
                <!-- FORM VIEW -->
                <div v-if="currentTab === 'Form'"
                    class=" bg-white p-2 md:p-6 text-gray-900 border border-gray-200 rounded-2xl shadow-md">
                    <!-- <Form v-if="schema" :schema="schema" v-model="formData" /> -->
                    <DynamicForm v-if="formData" :model="formData" @update:model="val => formData = val" />

                    <div class="mt-4 flex space-x-3">
                        <button @click="save" :disabled="saving"
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Saving…' : 'Save' }}
                        </button>
                        <button @click="reset"
                            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                            Reset
                        </button>
                    </div>
                </div>

                <!-- JSON VIEW -->
                <pre v-else-if="currentTab === 'JSON'"
                    class="max-w-2xl bg-white p-6 text-gray-900 border border-gray-200 rounded shadow-md overflow-auto max-h-[70vh]">{{ JSON.stringify(formData, null, 2) }}</pre>

                <!-- VERSIONS VIEW -->
                <div v-else class="max-w-2xl bg-white p-6 text-gray-900 border border-gray-200 rounded shadow-md">
                    <h2 class="text-xl font-semibold mb-4">Last 10 Versions</h2>
                    <ul class="space-y-3">
                        <li v-for="v in versions" :key="v.sha"
                            class="flex justify-between items-start bg-gray-50 p-4 border border-gray-200 rounded">
                            <div>
                                <div class="font-medium">{{ v.message }}</div>
                                <div class="text-sm text-gray-500">
                                    {{ new Date(v.date).toLocaleString() }}
                                </div>
                            </div>
                            <button @click="revert(v.sha)" class="text-red-600 hover:text-red-800 text-sm">
                                Revert
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Form from '@lljj/vue3-form-element'
import DynamicForm from '~/components/DynamicForm0.vue'

const route = useRoute()
const router = useRouter()
const name = route.params.name as string

const tabs = ['Form', 'JSON', 'Versions'] as const
const currentTab = ref('Form' as typeof tabs[number])

const schema = ref(null as any)
const formData = ref(null as any)
const versions = ref([] as { sha: string; message: string; date: string }[])
const saving = ref(false)

async function load() {
    const res = await $fetch(`/api/schema/${name}`, { params: { name } })
    schema.value = res.schema
    formData.value = res.data
    versions.value = await $fetch(`/api/versions/${name}`)
}

function reset() {
    load()
}

async function save() {
    saving.value = true
    await $fetch(`/api/save/${name}`, {
        method: 'POST',
        body: formData.value
    })
    await load()
    saving.value = false
}

async function revert(sha: string) {
    if (!confirm('Revert to this version?')) return
    await $fetch(`/api/revert/${name}`, {
        method: 'POST',
        body: { sha }
    })
    await load()
}

onMounted(load)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>