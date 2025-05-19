<template>
  <div v-if="visible" class="z-500 fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">

    <button class="fixed top-2 right-2 text-gray-500 text-red  z-100  hover:text-black" @click="close">✕</button>

    <div class="bg-black/50 backdrop-blur  rounded-lg p-6 max-h-[90vh] w-full max-w-3xl overflow-auto relative">
      <h2 class="text-xl font-bold mb-4">Edit JSON Data</h2>

      <ul class="font-mono text-sm">
        <TreeNode v-for="(val, key) in localData" :key="key" :data="localData" :label="key.toString()"
          :ref="el => treeRefs[key] = el" />
      </ul>

      <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" @click="save">
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import TreeNode from '@/components/TreeNode.vue'
const treeRefs: Record<string, any> = {}

const props = defineProps<{ data: any }>()
const emit = defineEmits(['close'])

const visible = ref(true)
const localData = reactive(JSON.parse(JSON.stringify(props.data))) // deep clone

const save = async () => {
  try {
    const res = await fetch('/api/save-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localData),
    })
    if (!res.ok) throw new Error('Save failed')

    document.querySelectorAll('[data-edited]').forEach(el => {
      el.classList.remove('bg-gray-400', 'bg-red-500')
      el.classList.add('bg-green-600')
    })
    Object.values(treeRefs).forEach(ref => {
      ref?.resetEdit?.()
    })

  } catch (err) {
    document.querySelectorAll('[data-edited]').forEach(el => {
      el.classList.remove('bg-gray-400', 'bg-green-600')
      el.classList.add('bg-red-500')
    })
  }
}

const close = () => {
  visible.value = false
  emit('close')
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}
watch(visible, (v) => {
  if (v) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
</script>