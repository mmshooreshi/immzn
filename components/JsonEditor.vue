<template>
  <div class="json-editor-wrapper">
    <div ref="container" class="h-[60vh] border border-gray-200 rounded"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, defineEmits, defineProps } from 'vue'
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

let editor: JSONEditor
const container = ref<HTMLDivElement | null>(null)

onMounted(() => {
  editor = new JSONEditor(container!.value!, {
    mode: 'tree',
    modes: ['tree', 'code'],   // allow toggling to raw JSON
    onChange: () => {
      try {
        const updated = editor.get()
        emit('update:modelValue', updated)
      } catch {
        // invalid JSON in code mode → ignore until valid
      }
    }
  })
  editor.set(props.modelValue)
})

watch(() => props.modelValue, (newVal) => {
  // only update if different (prevents cursor jank)
  try {
    const current = editor.get()
    if (JSON.stringify(current) !== JSON.stringify(newVal)) {
      editor.update(newVal)
    }
  } catch {
    // ignore if editor in invalid code state
  }
})

onBeforeUnmount(() => {
  editor.destroy()
})
</script>

<style scoped>
.json-editor-wrapper {
  /* ensure it fills available space */
  width: 100%;
}
</style>
