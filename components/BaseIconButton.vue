<!-- @/components/BaseIconButton.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

/**
 * A minimal, accessible icon-only button.
 *
 * Props
 *  - label  ✱  (string)         : Required ARIA label & sr-only text.
 *  - size   ☐  ('xs' | 'sm' | 'md' | 'lg') : Control w/h, default → md.
 *  - kind   ☐  ('primary' | 'ghost' | 'danger') : Colour variant.
 *  - as     ☐  ('button' | 'div')            : Rare: render as non-button element.
 *  - class  ☐  (string)                      : Extra classes.
 *
 * Slots
 *  - default (required) → the icon element, e.g. <Icon name="..." />
 */

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  size: {
    type: String as PropType<'xs' | 'sm' | 'md' | 'lg'>,
    default: 'md',
  },
  kind: {
    type: String as PropType<'primary' | 'ghost' | 'danger'>,
    default: 'ghost',
  },
  as: {
    type: String as PropType<'button' | 'div'>,
    default: 'button',
  },
  /**
   * Extra classes forwarded to root.
   * Use reserved name because `class` is not available in defineProps.
   */
  extraClass: {
    type: String,
    default: '',
  },
})

/* ────────────────────────────────────────────────────────────── */
const sizeClass = computed(() => {
  return (
    {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10',
      lg: 'w-12 h-12 text-lg',
    }[props.size] || 'w-10 h-10'
  )
})

const kindClass = computed(() => {
  return (
    {
      primary:
        'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
      danger:
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
      ghost:
        'bg-black/50 dark:bg-white/20 text-white hover:bg-gray-200/60 hover:text-black',
    }[props.kind] || ''
  )
})
</script>

<template>
  <component :is="as" :class="[
    'inline-flex items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-95 select-none',

    sizeClass,
    kindClass,
    extraClass,
  ]" :role="as === 'div' ? 'button' : undefined" :tabindex="as === 'div' ? 0 : undefined" :aria-label="label"
    @keydown.enter.prevent="$emit('click', $event)" @keydown.space.prevent="$emit('click', $event)">
    <slot />
    <!-- Usually the icon is visual; label lives here but hidden for a11y. -->
    <span class="sr-only">{{ label }}</span>
  </component>
</template>

<style scoped>
/***** Optional hover scaling for all browsers *****/
*:where(div, button)[role="button"],
button {
  transition: transform 0.15s var(--cubic-out, cubic-bezier(0.22, 0.61, 0.36, 1));
}

*:where(div, button)[role="button"]:hover:not(:disabled),
button:hover:not(:disabled) {
  transform: scale(1.05);
}
</style>