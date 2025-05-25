<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

/**
 * Props
 *  - node   : the value you want to render
 *  - k      : its key name (undefined for the root)
 *  - depth  : current depth – used only for indentation
 */
const props = defineProps<{
  node: unknown
  k?: string | number
  depth?: number
  isCollapsed?: boolean
}>()


/* ---------- helpers ---------- */

/** is this value expandable? */
const isBranch = computed(() =>
  props.node !== null && typeof props.node === 'object'
)

/** initial collapsed state: collapsed unless `isCollapsed: false` is present */
const collapsed = ref(
  isBranch.value &&
  // @ts-ignore – we first check that node is an object above
  (props.node as any).isCollapsed !== false
)

collapsed.value = props.isCollapsed

/** pretty label for a branch: “{ … }” or “[ … ]” (shown when collapsed) */
const preview = computed(() => {
  if (!isBranch.value) return ''
  const isArray = Array.isArray(props.node)
  const open = isArray ? '[' : '{'
  const close = isArray ? ']' : '}'
  return `${open} … ${close}`
})

/**
 * When a branch is expanded, we iterate over its own enumerable keys,
 * **skipping** a control property literally called `isCollapsed`.
 */
const entries = computed<[string | number, unknown][]>(() => {
  if (!isBranch.value) return []
  // @ts-ignore – checked above
  const obj = props.node as Record<string, unknown>
  return Object.keys(obj)
    .filter(key => key !== 'isCollapsed')
    .map(key => [key, obj[key]])
})
</script>

<template>
  <!-- indentation is purely visual -->
  <div :style="{ paddingLeft: `${(depth ?? 0) * 1}rem` }" class="m-2">
    <!-- ► / ▼ toggle only if value is a branch -->
    <span v-if="isBranch" class="cursor-pointer select-none text-sm " @click="collapsed = !collapsed">
      <!-- {{ collapsed ? '►' : '▼' }} -->
      <!-- {{ collapsed ? '▸' : '▾' }} -->
      <span v-if="collapsed" class="text-teal mx-2 hover:font-extrabold hover:text-teal-200">[+]</span>
      <span v-else class="text-black mx-2 hover:text-red">[-]</span>
      {{ collapsed }}
    </span>

    <!-- key label (omit for root) -->
    <span v-if="k !== undefined" class="text-purple-700 font-mono">
      {{ k }}<span class="text-gray-500">:</span>
    </span>

    <!-- leaf value -->
    <template v-if="!isBranch">
      <span class="text-green-800 font-mono">
        {{ typeof node === 'string' ? `"${node}"` : node }}
      </span>
    </template>

    <!-- collapsed branch preview -->
    <template v-else-if="collapsed">
      <span class="text-gray-500 font-mono">{{ preview }}</span>
    </template>

    <!-- expanded branch – recurse -->
    <template v-else>
      <span class="text-gray-500">
        {{ Array.isArray(node) ? '[' : '{' }}
      </span>
      <div v-for="[ck, cv] in entries" :key="ck">
        <JsonTree :node="cv" :k="ck" :depth="(depth ?? 0) + 1" />
      </div>
      <span class="text-gray-500">
        {{ Array.isArray(node) ? ']' : '}' }}
      </span>
    </template>
  </div>
</template>

<style scoped>
/* tiny hover affordance for caret */
span.cursor-pointer:hover {
  color: #2563eb;
}
</style>
