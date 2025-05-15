<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { OrbitControls } from '@tresjs/cientos'
import {
  TresCanvas,
} from '@tresjs/core'
import uglyBunny from '@/components/uglyBunny.vue'
import { GUI } from 'lil-gui'
import { Box3, Vector3 } from 'three'
const isMobile = useIsMobile();

// Refs for three objects
const cameraRef = ref<any>(null)
const controlsRef = ref<any>(null)
const bunnyGroupRef = ref<any>(null)

// Center and size computed once
let boxCenter: Vector3 | null = null
let boxSize: Vector3 | null = null

// Reactive GUI parameters
interface Params {
  cameraX: number; cameraY: number; cameraZ: number;
  enablePan: boolean; enableRotate: boolean; enableZoom: boolean;
  autoRotate: boolean; autoRotateSpeed: number;
  bunnyScale: number;
  groupPosX: number; groupPosY: number; groupPosZ: number;
  groupRotX: number; groupRotY: number; groupRotZ: number;
}

const params = reactive<Params>({
  cameraX: 0, cameraY: 0, cameraZ: 500,
  enablePan: false, enableRotate: true, enableZoom: false,
  autoRotate: false, autoRotateSpeed: 2,
  bunnyScale: 1,
  groupPosX: 0, groupPosY: 0, groupPosZ: 0,
  groupRotX: 0, groupRotY: 0, groupRotZ: 0,
})

// Apply group transform around computed center
function updateGroup() {
  if (!bunnyGroupRef.value || !boxCenter) return
  const gp = params
  const { x: cx, y: cy, z: cz } = boxCenter
  // position = offset from center plus manual position
  bunnyGroupRef.value.position.set(
    -cx + gp.groupPosX,
    -cy + gp.groupPosY,
    -cz + gp.groupPosZ
  )
  // rotation in radians
  bunnyGroupRef.value.rotation.set(
    (gp.groupRotX * Math.PI) / 180,
    (gp.groupRotY * Math.PI) / 180,
    (gp.groupRotZ * Math.PI) / 180
  )
  // scale
  bunnyGroupRef.value.scale.set(gp.bunnyScale, gp.bunnyScale, gp.bunnyScale)
  // ensure orbit target at origin
  controlsRef.value.target.set(0, 0, 0)
  controlsRef.value.update()
}


onMounted(() => {
  console.log("isMobile: ", isMobile.value)

  if (isMobile.value) {
    bunnyGroupRef?.value?.scale.set(0.6, 0.6, 0.6)

  }

  // const gui = new GUI()

  // // Camera folder
  // const camF = gui.addFolder('Camera')
  // camF.add(params, 'cameraX', -1000, 1000).onChange(v => cameraRef.value.position.x = v)
  // camF.add(params, 'cameraY', -1000, 1000).onChange(v => cameraRef.value.position.y = v)
  // camF.add(params, 'cameraZ', 0, 2000).onChange(v => cameraRef.value.position.z = v)
  // camF.open()

  // // Controls folder
  // const ctlF = gui.addFolder('Controls')
  // ctlF.add(params, 'enablePan').onChange(v => controlsRef.value.enablePan = v)
  // ctlF.add(params, 'enableRotate').onChange(v => controlsRef.value.enableRotate = v)
  // ctlF.add(params, 'enableZoom').onChange(v => controlsRef.value.enableZoom = v)
  // ctlF.add(params, 'autoRotate').name('Auto Rotate').onChange(v => controlsRef.value.autoRotate = v)
  // ctlF.add(params, 'autoRotateSpeed', 0.1, 10).name('Rotate Speed').onChange(v => controlsRef.value.autoRotateSpeed = v)
  // ctlF.open()

  // // Bunny folder (scale only)
  // const bunF = gui.addFolder('Bunny Scale')
  // bunF.add(params, 'bunnyScale', 0.1, 10).onChange(updateGroup)
  // bunF.open()

  // // Scene transform
  // const grpF = gui.addFolder('Scene')
  // grpF.add(params, 'groupPosX', -500, 500).name('Pos X').onChange(updateGroup)
  // grpF.add(params, 'groupPosY', -500, 500).name('Pos Y').onChange(updateGroup)
  // grpF.add(params, 'groupPosZ', -500, 500).name('Pos Z').onChange(updateGroup)
  // grpF.add(params, 'groupRotX', -180, 180).name('Rot X°').onChange(updateGroup)
  // grpF.add(params, 'groupRotY', -180, 180).name('Rot Y°').onChange(updateGroup)
  // grpF.add(params, 'groupRotZ', -180, 180).name('Rot Z°').onChange(updateGroup)
  // grpF.open()

  // Wait for model load then compute box and initial placement
  const interval = setInterval(() => {
    const obj = bunnyGroupRef.value?.object3d
    if (obj) {
      clearInterval(interval)
      const box = new Box3().setFromObject(obj)
      boxCenter = new Vector3()
      boxSize = new Vector3()
      box.getCenter(boxCenter)
      box.getSize(boxSize)
      updateGroup()
    }
  }, 100)
})
</script>

<template>
  <TresCanvas clear-color="#141414" window-size preset="realistic" class="myTresCanvas">
    <TresPerspectiveCamera ref="cameraRef" :position="[params.cameraX, params.cameraY, params.cameraZ]" />

    <OrbitControls ref="controlsRef" :enablePan="params.enablePan" :enableRotate="params.enableRotate"
      :enableZoom="params.enableZoom" :autoRotate="params.autoRotate" :autoRotateSpeed="params.autoRotateSpeed" />

    <!-- World axes helper -->
    <!-- <TresAxesHelper :args="[200]" /> -->

    <!-- Bunny group with centered pivot -->
    <TresGroup ref="bunnyGroupRef">
      <Suspense>
        <uglyBunny />
      </Suspense>
    </TresGroup>

    <!-- Red pivot at origin -->
    <TresMesh>
      <!-- <TresSphereGeometry :args="[5, 16, 16]" /> -->
      <!-- <TresMeshBasicMaterial color="red" /> -->
    </TresMesh>

    <!-- Bounding box wireframe at origin -->
    <TresMesh v-if="boxSize" :position="[0, 0, 0]">
      <TresBoxGeometry :args="[boxSize.x, boxSize.y, boxSize.z]" />
      <TresMeshBasicMaterial color="white" wireframe />
    </TresMesh>
  </TresCanvas>
</template>

<style>
.myTresCanvas {
  position: absolute !important;
  opacity: 0;
  animation: fadeIn 3s ease-out forwards;
  animation-delay: 3s;
  touch-action: pan-y !important;
  width: 110vw !important;
  height: 150vh !important;
  left: 0 !important;
  right: 0 !important;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
