<template>
    <li class="mb-1">
      <div class="flex items-start space-x-2">
        <!-- Expand toggle -->
        <span
          v-if="isExpandable(value) || Array.isArray(value)"
          @click="toggle"
          class="cursor-pointer select-none text-blue-600"
        >
          [{{ open ? '-' : '+' }}]
        </span>
  
        <!-- Label -->

        <span class="font-bold text-white/50">{{ displayLabel }}:</span>
  
        <!-- Expandable (array or object) -->
        <template v-if="(isExpandable(value) || Array.isArray(value)) && open">
          <ul class="pl-4 mt-1 w-full">
            <!-- Array -->
            <template v-if="Array.isArray(value)">
              <TreeNode
                v-for="(item, index) in value"
                :key="index"
                :data="value"
                :label="index.toString()"
              />
            </template>
  
            <!-- Object -->
            <template v-else>
              <TreeNode
                v-for="(val, key) in value"
                :key="key"
                :data="value"
                :label="key.toString()"
              />
            </template>
          </ul>
        </template>
  
        <!-- Primitive -->
        <template v-else-if="!isExpandable(value) && !Array.isArray(value)">
          <input
            class="border rounded px-1  text-green w-full text-sm transition"
            :value="value"
            @input="editValue($event)"
            :data-edited="isEdited"
            :class="{ 'text-yellow': isEdited }"
          />
        </template>
      </div>
    </li>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  
  const props = defineProps<{
    data: Record<string, any> | any[]
    label: string
  }>()
  
  const open = ref(false)
  const isEdited = ref(false)
  
  const toggle = () => {
    open.value = !open.value
  }
  
  // Dynamically access current value
  const value = computed(() => {
    return Array.isArray(props.data)
      ? props.data[Number(props.label)]
      : props.data[props.label]
  })
  
  // Display label with optional array index format
  const displayLabel = computed(() =>
  {
    if (Array.isArray(props.data)) {
        open.value = true
        // return `[${props.label}]`
        return ''
    } else {
        return props.label
    }
  }
  )


  
  // Handle edits
  const editValue = (e: Event) => {
    const target = e.target as HTMLInputElement
    const newValue = tryParse(target.value)
  
    if (Array.isArray(props.data)) {
      props.data[Number(props.label)] = newValue
    } else {
      props.data[props.label] = newValue
    }
  
    isEdited.value = true
    target.setAttribute('data-edited', 'true')
  }
  
  // Try to interpret numbers, booleans, null
  function tryParse(val: string): any {
    if (val === 'true') return true
    if (val === 'false') return false
    if (val === 'null') return null
    const num = Number(val)
    return isNaN(num) ? val : num
  }
  
  // Expandable = object (non-null, not array)
  const isExpandable = (val: any) =>
    typeof val === 'object' && val !== null && !Array.isArray(val)
  
  
    defineExpose({
  resetEdit() {
    isEdited.value = false
    console.log("EEEEEEE")
  }
})

  </script>
  