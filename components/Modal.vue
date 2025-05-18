<template>
    <teleport to="body">
        <transition name="fade-scale">
            <div v-if="open" class=" fixed inset-0 z-50 flex items-center justify-center">
                <!-- Overlay -->
                <div class="absolute -inset-8 bg-black/40 backdrop-blur-sm transition-all" @click.self="emitClose">
                </div>

                <!-- Modal Content -->
                <div class="max-w-sm bg-red h-max m-auto relative z-10 max-w-2xl w-full bg-white/10 dark:bg-[#0b0b0d]/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
                    tabindex="0" ref="modalRef">
                    <!-- Close Button -->
                    <button @click="emitClose" class="absolute top-3 right-3 text-white/60 hover:text-white transition">
                        <Icon name="mdi:close" class="w-6 h-6" />
                    </button>

                    <slot />
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    open: Boolean,
});
const emit = defineEmits(['close']);

const modalRef = ref(null);

const handleKey = (e) => {
    if (e.key === 'Escape') emit('close');
};

const emitClose = () => emit('close');

onMounted(() => {
    document.addEventListener('keydown', handleKey);
    document.body.classList.add('overflow-hidden');
});
onUnmounted(() => {
    document.removeEventListener('keydown', handleKey);
    document.body.classList.remove('overflow-hidden');
});
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.3s ease;
}

.fade-scale-enter-from {
    opacity: 1;
    transform: scale(0.95);
}

.fade-scale-leave-to {
    opacity: 1;
    transform: scale(0.95);
}
</style>