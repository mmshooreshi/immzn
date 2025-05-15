<template>
  <div class="space-y-6 ">
    <template v-for="(value, key) in model" :key="key">

      <!-- 1) Translation-field: exactly en/fa -->
      <div v-if="isTranslation(value)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block">
          <div class="font-semibold mb-1">{{ key }} <span class="text-xs">(english)</span></div>
          <input v-if="!isLongString(model[key].en)" type="text" v-model="model[key].en"
            class="w-full border border-gray-300 border-solid rounded-xl p-2" />
          <textarea v-else v-model="model[key].en" :ref="el => textareaRefs[key + 'EN'] = el"
            @input="() => resizeTextarea(key + 'EN')"
            class="w-full border border-gray-300 border-solid rounded-xl p-2 resize-none" style="overflow:hidden" />

        </label>
        <label dir="rtl" class="block">
          <div class="font-semibold mb-1">{{ key }} <span class="text-xs">(فارسی)</span></div>
          <input v-if="!isLongString(model[key].fa)" type="text" v-model="model[key].fa"
            class="w-full border border-gray-300 border-solid rounded-xl p-2" />
          <textarea v-else v-model="model[key].fa" :ref="el => textareaRefs[key + 'FA'] = el"
            @input="() => resizeTextarea(key + 'FA')"
            class="w-full border border-gray-300 border-solid rounded-xl p-2 resize-none" style="overflow:hidden" />
        </label>
      </div>
      <!-- 2) Array -->
      <div v-else-if="Array.isArray(value)" class="space-y-4">
        <fieldset class="p-4 border border-gray-300 border-solid rounded-xl">
          <legend class="font-semibold">{{ key }} (array)</legend>
          <div v-for="(item, idx) in value" :key="idx" class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">Item {{ idx + 1 }}</span>
              <button @click="removeArrayItem(key, idx)" class="text-red-600 hover:underline text-sm">Remove</button>
            </div>
            <!-- recurse into each item -->
            <DynamicForm v-if="isObject(item)" :model="model[key][idx]"
              @update:model="val => (model[key][idx] = val)" />
            <div v-else>
              <input v-if="!isLongString(model[key][idx])" type="text" v-model="model[key][idx]"
                class="w-full border border-gray-300 border-solid rounded-xl p-2" />
              <textarea v-else v-model="model[key][idx]" rows="4"
                class="w-full border border-gray-300 border-solid rounded-xl p-2" />
            </div>
          </div>
          <button @click="addArrayItem(key)"
            class="mt-2 px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm">
            Add {{ key }}
          </button>
        </fieldset>
      </div>
      <!-- 3) Nested object -->
      <div v-else-if="isObject(value)" class="p-4 border border-gray-300 border-solid rounded-xl">
        <legend class="font-semibold mb-2 block">{{ key }}</legend>
        <DynamicForm :model="model[key]" @update:model="val => (model[key] = val)" />
      </div>

      <!-- 4) Primitive -->
      <div v-else>
        <label class="block">
          <div class="font-semibold mb-1">{{ key }}</div>
          <input v-if="!isLongString(value)" type="text" v-model="model[key]"
            class="w-full border border-gray-300 border-solid rounded-xl p-2" />
          <textarea v-else v-model="model[key]" rows="4"
            class="w-full border border-gray-300 border-solid rounded-xl p-2" />
        </label>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { toRaw } from 'vue'
import { defineProps, defineEmits, watch } from 'vue'
import DynamicForm from '~/components/DynamicForm0.vue'

interface Translation { en: string; fa: string }

const props = defineProps<{ model: Record<string, any> }>()
const emit = defineEmits<{ (e: 'update:model', val: Record<string, any>): void }>()

// Helpers
function isObject(val: any): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}
function isTranslation(val: any): val is Translation {
  return isObject(val) && Object.keys(val).sort().join(',') === 'en,fa'
}
function isLongString(val: any): val is string {
  return typeof val === 'string' && val.length > 20
}

// Array ops
function addArrayItem(key: string) {
  const arr = toRaw(props.model[key])
  let sample = arr[0] !== undefined ? JSON.parse(JSON.stringify(arr[0])) : ''
  props.model[key].push(sample)
  emit('update:model', props.model)
}
function removeArrayItem(key: string, idx: number) {
  props.model[key].splice(idx, 1)
  emit('update:model', props.model)
}

// Watch deep and emit up
watch(
  () => props.model,
  (newVal) => emit('update:model', newVal),
  { deep: true }
)






const textareaRefs = reactive<Record<string, HTMLTextAreaElement>>({})
function resizeTextarea(key: string) {
  const el = textareaRefs[key]
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

// when component mounts, size all of them once
onMounted(() => {
  nextTick(() => {
    Object.keys(textareaRefs).forEach(key => resizeTextarea(key))
  })
})



</script>