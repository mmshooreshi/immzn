<script setup lang="ts">
import { OrbitControls } from '@tresjs/cientos'
import { TresCanvas } from '@tresjs/core'
import uglyBunny from '@/components/uglyBunny.vue'
import { gsap } from 'gsap'




// animate the loaded scene immediately
</script>

<template>
  <TresCanvas clear-color="#0b0b0d" window-size   preset="realistic" class="myTresCanvas">
    <TresPerspectiveCamera :position="[300,-10,300]" />
    <!-- disable panning -->
    <OrbitControls :enablePan="false" :enableRotate="true" :enableZoom="false"  />
    <!-- :minPolarAngle="Math.PI / 2"
    :maxPolarAngle="Math.PI / 2" -->

    <Suspense>
      <uglyBunny />
    </Suspense>

    <TresDirectionalLight :intensity="200" :position="[3, 3, -30]" />
    <TresDirectionalLight :intensity="200" :position="[3, 3, 30]" />

    <!-- <TresAmbientLight :intensity="100" /> -->
  </TresCanvas>
</template>

<style>
.myTresCanvas{
  position: absolute !important;
  opacity: 0;
  animation: fadeIn 3s ease-out forwards;
  animation-delay: 3s;
  touch-action: pan-y !important; 


}


@keyframes fadeIn {
  to { opacity: 1; }
}

</style>
