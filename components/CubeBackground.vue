<script setup lang="ts">
import type Spline from '@splinetool/runtime';

const canvas = ref<HTMLCanvasElement>();
const visible = ref(false);
const spline = ref<Spline.Application>();
const isMobile = useIsMobile();

onMounted(async () => {
  // if (window.innerWidth > 480 && canvas.value) {
  if (window.innerWidth > 180 && canvas.value) {
    const { Application } = await import('@splinetool/runtime');
    spline.value = new Application(canvas.value);
    await spline.value?.load('/spline/cube.splinecode');

    visible.value = true;
    console.log(spline.value.getSplineEvents().start['b0527698-26a5-4abf-83c4-6d066821070d']);

    return;

  }

  setTimeout(() => {
    visible.value = true;

  }, 1000);
});

onUnmounted(() => {
  spline.value?.dispose();
});
</script>

<template>
  <!-- <img
    v-if="isMobile"
    :class="['image', { visible }]"
    src="/images/cube.webp"
    alt=""
    width="384"
    height="384"
  /> -->
  <canvas ref="canvas" :class="['canvas', { visible }]" />
</template>

<style scoped lang="scss">
.image {
  translate: 0 -4rem;
}

.image,
.canvas {
  position: absolute;
  transition: opacity 3s variables.$ease-in-out;
}

.image:not(.visible),
.canvas:not(.visible) {
  opacity: 0;
}
</style>
