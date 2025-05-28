<template>
  <div class="relative">
    <input v-bind="forward" v-model="display" :type="numberOnly ? 'tel' : 'text'" :placeholder="forward.placeholder"
      @focus="onFocus" @blur="onBlur" @input="handleInput" :class="[
        'rtl w-full rounded-2xl  text-gray-900 dark:text-white/50 text-left bg-transparent px-6 py-5 text-md tracking-normal hover:tracking-widest transition-all duration-300 font-semibold outline-none ring-0 focus:ring-1 border ',
        borderClass,
        placeholderClass,
        forward.class,
        forward.disabled && 'cursor-not-allowed opacity-60'
      ]" />


    <!-- floating label using VueUse Motion -->
    <label ref="labelRef" :class="[
      floatingLabelClass,
      // <-- use a real ternary here
      props.persian ? 'labelFa' : 'labelEn'
    ]" class="absolute top-4 -mt-3 text-gray-500 pointer-events-none z-10 will-change-transform px-2">
      {{ forward.floatinglabel }}
    </label>




    <div class="h-full absolute w-1 bg-transparent right-0 top-0">
      <!-- clear icon -->
      <div v-if="(display && state !== 'success') || iconName" @click="display && state !== 'success' && (display = '')"
        :class="['absolute -left-8 right-6 inset-y-0 flex items-center h-full w-5 group', position + '-3', iconColor]">
        <span v-if="display && state !== 'success'" class="relative w-5 h-5 cursor-pointer group">
          <span
            class="absolute inset-0 rounded-full bg-gray-300 transform transition duration-200 scale-75 group-hover:scale-150 group-hover:opacity-100" />
          <Icon name="mdi:close-circle" class="w-5 h-5  text-black/40 dark:text-gray-700" />
        </span>
        <span v-else class="relative w-5 h-5 flex flex-row">
          <div
            class="rtl absolute z-10 w-max max-w-xs px-3 -mt-2 pt-1.5 pb-1.5 flex items-center text-xs text-white/100 bg-black/80 rounded-xl shadow-sm opacity-0 leading-6 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            :class="[position === 'right' ? 'left-full ml-2' : 'right-full mr-2']">
            {{ tooltipText }}
          </div>

          <Icon v-if="iconName !== 'mdi:alert-circle'" :name="iconName" class="w-5 h-5" />
        </span>
      </div>
    </div>
    <!-- <p v-if="props.error" class="-mt-2 border-red border rounded-xl  text-center left-[20%] right-[20%]  absolutebg-[#F9FBFA]/100 text-xs rtl text-xs scale-90 text-red-600">{{ props.error }}</p> -->
    <!-- class="absolute right-5 top-4  bg-[#F9FBFA]/100  text-gray-500 pointer-events-none z-10 will-change-transform px-2" -->


  </div>

</template>

<script setup lang="ts">
import { computed, ref, watch, useAttrs, withDefaults } from 'vue'
import { toPersianDigits, toEnglishDigits } from '~/utils/digits'
import { useMotionProperties, useSpring } from '@vueuse/motion'

// Props
const props = withDefaults(defineProps<{ persian?: boolean; iconName?: string | null; position?: 'right' | 'left'; tooltip?: string; numberOnly?: boolean; error?: string; floatingLabelClass?: string; placeholderClass?: string; }>(), {
  persian: false,
  iconName: null,
  position: 'right',
  tooltip: 'هیچ',
  numberOnly: false,
  error: '',
  floatingLabelClass: 'bg-white dark:bg-purple-300/5',
  placeholderClass: ''
})


// Forward attrs & v-model
const attrs = useAttrs()
const { persian, ...forward } = attrs as Record<string, any>
const model = defineModel<string | number | null>()
const display = computed({
  get: () => props.persian
    ? toPersianDigits(String(model.value ?? ''))
    : String(model.value ?? ''),
  set: v => model.value = props.persian ? toEnglishDigits(v) : v,
})
const handleInput = (e: Event) => {
  const t = e.target as HTMLInputElement
  t.value = props.numberOnly ? t.value.replace(/[^\d۰-۹]/g, '') : t.value
  display.value = t.value
}

// Focus state
const isFocused = ref(false)
const onFocus = () => { isFocused.value = true }
const onBlur = () => { isFocused.value = false }

// Validation styling
const state = computed(() =>
  props.iconName?.includes('check') ? 'success'
    : props.iconName?.includes('alert') || props.iconName?.includes('error') ? 'error'
      : 'default'
)
const borderClass = computed(() =>
  state.value === 'success' ? 'border-green-500  focus:border-green-500'
    // : props.error  ? 'border-red-500 text-red-600 focus:border-red-500'
    : state.value === 'error' ? ''  // (fallback, though iconName.alert now covered by props.error)
      : 'border-gray-300 text-gray-500'
)
const iconColor = computed(() =>
  state.value === 'success' ? 'text-cyan-500'
    : props.error ? 'text-red-500'
      : state.value === 'error' ? ''  // fallback
        : 'text-gray-400'
)
const tooltipText = computed(() =>
  props.iconName?.includes('check') ? 'عالیه!'
    : props.iconName?.includes('alert') ? 'شماره‌ی موبایل باید با ۰۹ شروع شود.'
      : props.iconName?.includes('error') ? 'بد شد'
        : props.tooltip || ''
)

// Motion for label
const labelRef = ref<HTMLElement | null>(null)
const { motionProperties } = useMotionProperties(labelRef, { y: 0, scale: 1 })
const { set: animateLabel } = useSpring(motionProperties, { stiffness: 500, damping: 30 })

// Trigger animation on floating state change
const isFloating = computed(() => isFocused.value || !!display.value)
watch(isFloating, f => {
  animateLabel({ y: f ? -28 : 0, scale: f ? 0.65 : 1 })
}, { immediate: true })
</script>

<style scoped>
label {
  position: absolute;
  top: 50%;
  /* background-color: #F9FBFA; */
  /* padding: 0; */
}

.labelFa {
  right: 1.25rem;
  transform-origin: right center;
  /* background-color: #F9FBFA; */
  /* padding: 0; */
}

.labelEn {
  left: 1.25rem;
  transform-origin: left center;
  /* background-color: #F9FBFA; */
  /* padding: 0; */
}
</style>