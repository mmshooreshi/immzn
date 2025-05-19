<script setup lang="ts">
/*
 * UglyBunny.vue  –  v6 ⚡ ultra‑snappy
 * ---------------------------------------------------------------------------
 *  • perpetual yaw spin (BASE_Y)
 *  • ANY pointer/touch inside the canvas → instant neon‑cyan wireframe flash → fade back
 *  • zero per‑frame allocations, minimal ray‑casting, overlay lines excluded from picking
 * ---------------------------------------------------------------------------
*/

import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'
import { useLoop, useTres } from '@tresjs/core'
import { RGBELoader } from 'three-stdlib'

/******************** tiny logger ********************/
const log = (msg: string, css = 'color:#0af') => console.log(`%c[UglyBunny] ${msg}`, css)

/******************** scene & model ********************/
const pivot = new THREE.Group()
const { scene: model } = await useGLTF('/spline/scene.gltf', { draco: true })
pivot.add(model)

const { scene: tresScene, renderer } = useTres()

/******************** once mounted ********************/
onMounted(async () => {
  tresScene.value.add(pivot)
  centerModel()
  await applyGlass()
  cacheMeshes()
  buildEdgeOverlay()
  window.addEventListener('pointerdown', flashWire, { passive: true }) // global trigger, ultra‑reliable
  window.addEventListener('pointermove', flashWire, { passive: true }) // global trigger, ultra‑reliable

  log('ready ✓', 'color:#0f0')
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', flashWire)
  window.removeEventListener('pointermove', flashWire)

})

/******************** utils ********************/
function centerModel() {
  const bb = new THREE.Box3().setFromObject(model)
  const c = new THREE.Vector3()
  bb.getCenter(c)
  model.position.sub(c)
}

async function applyGlass() {
  const hdr = await new RGBELoader().setPath('/spline/').loadAsync('s.hdr')
  hdr.mapping = THREE.EquirectangularReflectionMapping
  tresScene.value.environment = hdr
  model.traverse(o => {
    if ((o as THREE.Mesh).isMesh) {
      const m = o as THREE.Mesh
      const b = m.material as THREE.MeshStandardMaterial
      m.material = new THREE.MeshPhysicalMaterial({
        map: b.map,
        normalMap: b.normalMap,
        roughnessMap: b.roughnessMap,
        metalnessMap: b.metalnessMap,
        transparent: true,
        transmission: 1,
        roughness: 0,
        metalness: 0,
        ior: 0.9,
        thickness: 0.25,
        envMapIntensity: 1.1,
      })
    }
  })
}

/******************** mesh + overlay cache ********************/
interface MeshData {
  mat: THREE.MeshPhysicalMaterial
  edgeMat: THREE.LineBasicMaterial
  baseOpacity: number
}
const meshes: MeshData[] = []

function cacheMeshes() {
  model.traverse(o => {
    if ((o as THREE.Mesh).isMesh) {
      const mesh = o as THREE.Mesh
      const mat = mesh.material as THREE.MeshPhysicalMaterial
      meshes.push({ mat, edgeMat: new THREE.LineBasicMaterial(), baseOpacity: mat.opacity ?? 1 })
    }
  })
}

function buildEdgeOverlay() {
  meshes.forEach(({ mat, edgeMat }, i) => {
    edgeMat.color.set(0x00ffff)
    edgeMat.transparent = true
    edgeMat.opacity = 0
    const mesh = (model.getObjectByProperty('material', mat) as THREE.Mesh)
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 10), edgeMat)
    edge.raycast = () => { }           // ignore picking → main mesh always receives the ray
    mesh.add(edge)
  })
  log(`edge overlay built on ${meshes.length} meshes`, 'color:#09f')
}

/******************** flash state ********************/
const flash = ref(0)               // 0 ▸ idle, 1 ▸ peak wireframe
const FLASH_TIME = 0.4             // seconds: faster fade for punchier feel

function flashWire() {
  flash.value = 1
}

/******************** render loop ********************/
const BASE_Y = 1.5
let spinY = 0

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  /* ---------- spin ---------- */
  spinY += delta * BASE_Y
  pivot.rotation.y = spinY

  /* ---------- flash fade ---------- */
  if (flash.value > 0) {
    flash.value = Math.max(0, flash.value - delta / FLASH_TIME)
    const t = flash.value // 1 → 0
    const ease = 1 - (1 - t) * (1 - t) * (1 - t) // cubic‑out once per frame

    for (let i = 0; i < meshes.length; i++) {
      const { mat, edgeMat, baseOpacity } = meshes[i]
      edgeMat.opacity = ease
      const surf = THREE.MathUtils.lerp(0.05, baseOpacity, 1 - ease)
      mat.opacity = surf
      mat.transparent = surf < 1
    }
  }
})
</script>

<template>
  <!-- no per‑object listeners needed: global pointerdown already triggers flash -->
  <primitive :object="pivot" />
</template>
