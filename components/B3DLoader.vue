<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { OrbitControls } from '@tresjs/cientos'
import { TresCanvas } from '@tresjs/core'
import UglyBunny from '@/components/uglyBunny.vue'
import { Box3, Vector3 } from 'three'

/* -------------------------------------------------------------------------- */
/* 1. Refs                                                                   */
/* -------------------------------------------------------------------------- */
const cameraRef = ref<any>(null)
const controlsRef = ref<any>(null)
const bunnyGroupRef = ref<any>(null)

/* -------------------------------------------------------------------------- */
/* 2. Device check                                                           */
/* -------------------------------------------------------------------------- */
const isMobile = useIsMobile()

/* -------------------------------------------------------------------------- */
/* 3. Reactive parameters                                                    */
/* -------------------------------------------------------------------------- */
interface Params {
  camera: { x: number; y: number; z: number }
  enablePan: boolean
  enableRotate: boolean
  enableZoom: boolean
  autoRotate: boolean
  autoRotateSpeed: number
  bunnyScale: number
  groupPos: { x: number; y: number; z: number }
  groupRot: { x: number; y: number; z: number }
}

const params = reactive<Params>({
  camera: { x: 0, y: 0, z: 500 },
  enablePan: false,
  enableRotate: true,
  enableZoom: false,
  autoRotate: false,
  autoRotateSpeed: 2,
  bunnyScale: 1,
  groupPos: { x: 0, y: 0, z: 0 },
  groupRot: { x: 0, y: 0, z: 0 },
})

/* -------------------------------------------------------------------------- */
/* 4. Group placement helpers                                                */
/* -------------------------------------------------------------------------- */
let boxCenter: Vector3 | null = null

function updateGroup() {
  const g = bunnyGroupRef.value
  if (!g || !boxCenter) return

  // position around pivot
  g.position.set(
    -boxCenter.x + params.groupPos.x,
    -boxCenter.y + params.groupPos.y,
    -boxCenter.z + params.groupPos.z,
  )

  // rotation (deg ➜ rad)
  g.rotation.set(
    (params.groupRot.x * Math.PI) / 180,
    (params.groupRot.y * Math.PI) / 180,
    (params.groupRot.z * Math.PI) / 180,
  )

  // scale
  g.scale.setScalar(params.bunnyScale)
}

/* -------------------------------------------------------------------------- */
/* 5. Initialisation                                                         */
/* -------------------------------------------------------------------------- */
onMounted(() => {
  // Mobile tweaks
  if (isMobile.value) params.bunnyScale *= 0.9

  // OrbitControls polish
  const c = controlsRef.value
  if (c) {
    c.enableDamping = true
    c.dampingFactor = 0.07
    c.rotateSpeed = 400000          // drag orbit ×4
  }

  // Wait until model is loaded then compute its bounding box
  const timer = setInterval(() => {
    const obj = bunnyGroupRef.value?.object3d
    if (obj) {
      clearInterval(timer)
      const box = new Box3().setFromObject(obj)
      boxCenter = new Vector3()
      box.getCenter(boxCenter)
      updateGroup()
    }
  }, 100)
})
</script>

<template>
  <TresCanvas clear-color="#141414" window-size preset="realistic" class="myTresCanvas">
    <TresPerspectiveCamera ref="cameraRef" :position="[params.camera.x, params.camera.y, params.camera.z]" />

    <OrbitControls ref="controlsRef" :enable-pan="params.enablePan" :enable-rotate="params.enableRotate"
      :enable-zoom="params.enableZoom" :auto-rotate="params.autoRotate" :auto-rotate-speed="params.autoRotateSpeed"
      :enable-damping="true" />

    <!-- Pivot group that holds the model; we pass controls to child so it can boost spin -->
    <TresGroup ref="bunnyGroupRef">
      <Suspense>
        <UglyBunny :controls="controlsRef" />
      </Suspense>
    </TresGroup>

    <!-- Invisible origin marker -->
    <TresMesh />
  </TresCanvas>
</template>

<style scoped>
.myTresCanvas {
  position: absolute;
  opacity: 0;
  animation: fadeIn 3s ease-out forwards;
  animation-delay: 1.5s;
  touch-action: pan-y !important;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
