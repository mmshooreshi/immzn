<template>
    <teleport to="body">
        <!-- Wrap the whole dialog in one Transition so the overlay + panel
           are mounted/un‑mounted together (avoids flashes) -->
        <Transition appear @before-enter="onBeforeEnter" @after-leave="onAfterLeave">
            <div v-if="open" class=" fixed top-16 inset-0 z-50 flex items-center justify-center pointer-events-auto"
                aria-modal="true" role="dialog">
                <!-- ─────────── Overlay ─────────── -->
                <Transition name="overlay" appear>
                    <div v-if="open" class="absolute inset-0 bg-black/40 backdrop-blur-lg" @click.self="emitClose" />
                </Transition>

                <!-- ─────────── Dialog panel ─────────── -->
                <Transition name="modal" appear>
                    <div v-if="open" ref="modalRef" tabindex="0"
                        class="outline-teal/50 outline outline-1 outline-offset-5    mx-8 max-w-sm relative z-10 w-full max-w-2xl px-2 md:px-8 py-6 rounded-3xl shadow-2xl bg-white/50 dark:bg-[#0b0b0d]/60 backdrop-blur-xl ">
                        <!-- Close btn -->
                        <button @click="emitClose"
                            class="absolute top-3 right-3 text-white/60 hover:text-white transition-colors duration-200"
                            aria-label="Close dialog">
                            <Icon name="mdi:close" class="w-6 h-6" />
                        </button>
                        <slot />
                    </div>
                </Transition>
            </div>
        </Transition>
    </teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted, ref, nextTick } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
    (e: 'close'): void
}>()

const modalRef = ref<HTMLElement | null>(null)

/********************* helpers ************************/
const emitClose = () => emit('close')

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') emitClose()
}

/** Scroll‑lock without layout jump (keeps the viewport width unchanged) */
const lockScroll = () => {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.paddingRight = `${scrollbar}px`
    document.body.classList.add('overflow-hidden')
}
const unlockScroll = () => {
    document.body.style.paddingRight = ''
    document.body.classList.remove('overflow-hidden')
}

/***************** reactivity + lifecycle **************/
watch(
    () => props.open,
    (value) => {
        if (value) {
            document.addEventListener('keydown', onKeydown)
            lockScroll()
            nextTick(() => modalRef.value?.focus())
        } else {
            document.removeEventListener('keydown', onKeydown)
            unlockScroll()
        }
    },
    { immediate: true }
)

onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown)
    unlockScroll()
})

/****************** Transition hooks *******************/
function onBeforeEnter() {
    /* fix the classic 100vh iOS bug so the overlay always covers the full screen */
    document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
}
function onAfterLeave() {
    document.documentElement.style.removeProperty('--vh')
}
</script>

<style scoped>
/******** Overlay ********/
.overlay-enter-active,
.overlay-leave-active {
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}

/******** Dialog panel ********/
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform, opacity;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: translateY(1.25rem) scale(0.96);
}
</style>