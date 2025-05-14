<!-- components/GlassCube.vue  (or swap the geometry for your antibody) -->
<script setup lang="ts">
import { shallowRef } from 'vue'
import { Vector3, MeshPhysicalMaterial, LoadingManager } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useLoop } from '@tresjs/core'
// import { EffectComposer, UnrealBloom, ChromaticAberration,
//          HueSaturation, Noise } from '@tresjs/post-processing'

/* ───── scene refs ───────────────────────────────────────────── */
const meshRef   = shallowRef()          // cube / antibody
const cursorPos = new Vector3()         // world-space target

/* ───── perpetual spin  +  mouse  look-at ────────────────────── */
useLoop().onBeforeRender(({ delta, camera }) => {
  if (!meshRef.value) return

  // ❶ Spin
  meshRef.value.rotation.y += delta * 0.6    // ≈ 35°/s (matches Spline)

  // ❷ Look-at cursor
  meshRef.value.lookAt(cursorPos)
})

function onPointerMove (ev: PointerEvent) {
  const { width, height, left, top } = (ev.target as HTMLElement).getBoundingClientRect()
  const ndc = new Vector3(
    ((ev.clientX - left)  / width)  * 2 - 1,
    (-(ev.clientY - top) / height) * 2 + 1,
    0.5
  )
  ndc.unproject(useTresContext().camera.value)
  cursorPos.copy(ndc)
}

/* ───── load geometry (cube or antibody GLB)─────────────────── */
const loader = new GLTFLoader(new LoadingManager())
loader.load('/models/cube.glb', gltf => {
  // replace Spline matcap with a physical glass material
  gltf.scene.traverse(obj => {
    if (obj.isMesh) {
      obj.material = new MeshPhysicalMaterial({
        color           : '#828282',
        transmission    : 1,
        roughness       : 0.3,
        ior             : 1.5,
        envMapIntensity : 1.2,
        toneMapped      : false      // lets bloom see >1.0 HDR highlights
      })
    }
  })
  meshRef.value = gltf.scene
})
</script>

<template>
  <TresCanvas
    clear-color="transparent"
    @pointermove="onPointerMove"
  >
    <!-- ─── camera (orthographic, Spline-sized) ─────────────── -->
    <TresOrthographicCamera
      :position="[582.6846, 569.2383, 580.0401]"
      :near="-100000"
      :far="100000"
      :zoom="0.45125"
      make-default
    />

    <!-- ─── cube / antibody ─────────────────────────────────── -->
    <primitive v-if="meshRef" :object="meshRef" />

    <!-- ─── post-processing stack (Bloom → CA → Hue/Sat → Noise) -->
    <Suspense>
      <EffectComposer>
        <UnrealBloom
          :strength="3"
          :radius="1"
          :threshold="0.295"
        />
        <ChromaticAberration :offset="[2, 0]" />
        <HueSaturation :hue="0.5" :saturation="0.6" />
        <Noise :opacity="0.2" />
      </EffectComposer>
    </Suspense>
  </TresCanvas>
</template>
