<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'
import { useLoop, useTresContext } from '@tresjs/core'
import { RGBELoader } from 'three-stdlib'
import GUI from 'lil-gui'

// ────────────────────────────────────────────────────────────────────────────────
// 1.  LOAD MODEL INSIDE A PIVOT
// ────────────────────────────────────────────────────────────────────────────────
const pivot = new THREE.Group()
const { scene: model } = await useGLTF('/spline/scene.gltf', { draco: true })
pivot.add(model)

const { scene: threeScene } = useTresContext()
threeScene.value.add(pivot)

// ────────────────────────────────────────────────────────────────────────────────
// 2.  ENVIRONMENT MAP FOR GLASS MATERIAL
// ────────────────────────────────────────────────────────────────────────────────

onMounted(async () => {
  // Centre model so its local origin sits at pivot (0,0,0)
  const bbox = new THREE.Box3().setFromObject(model)
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  model.position.sub(center)

  // HDRI reflections
  const hdr = await new RGBELoader().setPath('/spline/').loadAsync('s.hdr')
  hdr.mapping = THREE.EquirectangularReflectionMapping
  threeScene.value.environment = hdr

  // Swap every mesh material for transmissive glass
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const mesh = o as THREE.Mesh
      const old = mesh.material as THREE.MeshStandardMaterial
      mesh.material = new THREE.MeshPhysicalMaterial({
        map: old.map, normalMap: old.normalMap, roughnessMap: old.roughnessMap, metalnessMap: old.metalnessMap,
        transparent: true, transmission: 1, roughness: 0, metalness: 0, ior: 0.9,
        thickness: 0.25, envMapIntensity: 1.1,
      })
      mesh.material.needsUpdate = true
    }
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// 3.  SPRING‑BACK LOGIC
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Home pose: position (0,0,0), rotation (0,0,0), scale (1,1,1)
 * We store linear Euler angles for simplicity.
 */
const HOME = {
  pos: new THREE.Vector3(10, 50, 0),
  rot: new THREE.Euler(0, 0, 0, 'YXZ'),
  scl: new THREE.Vector3(1, 1, 1),
}

const spring = reactive({
  stiffness: 3.0,   // higher = faster snap
  damping: 0.9,   // <1, closer to 1 = less bounce
})

// Velocity holders (not reactive)
const vPos = new THREE.Vector3()
const vRot = new THREE.Euler()
const vScl = new THREE.Vector3()

function dampScalar(current: number, target: number, vel: { value: number }, k: number, d: number, dt: number) {
  const force = (target - current) * k
  vel.value += force * dt
  vel.value *= d
  return current + vel.value * dt
}

function dampVector3(current: THREE.Vector3, target: THREE.Vector3, vel: THREE.Vector3, k: number, d: number, dt: number) {
  const fx = (target.x - current.x) * k
  const fy = (target.y - current.y) * k
  const fz = (target.z - current.z) * k
  vel.x = (vel.x + fx * dt) * d
  vel.y = (vel.y + fy * dt) * d
  vel.z = (vel.z + fz * dt) * d
  current.x += vel.x * dt
  current.y += vel.y * dt
  current.z += vel.z * dt
}

function dampEuler(current: THREE.Euler, target: THREE.Euler, vel: THREE.Euler, k: number, d: number, dt: number) {
  // Dampen each component but handle wraparound nicely for yaw (y)
  const wrap = (angle: number) => THREE.MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI
  const diffY = wrap(target.y - current.y)
  const fx = (target.x - current.x) * k
  const fy = diffY * k
  const fz = (target.z - current.z) * k
  vel.x = (vel.x + fx * dt) * d
  vel.y = (vel.y + fy * dt) * d
  vel.z = (vel.z + fz * dt) * d
  current.x += vel.x * dt
  current.y += vel.y * dt
  current.z += vel.z * dt
}

// ────────────────────────────────────────────────────────────────────────────────
// 4.  DEV GUI FOR SPRING TUNING
// ────────────────────────────────────────────────────────────────────────────────
let gui: GUI | undefined
onMounted(() => {
  // gui = new GUI({ width: 200 })
  // gui.add(spring, 'stiffness', 1, 20, 0.1)
  // gui.add(spring, 'damping', 0.5, 0.99, 0.01)
  // gui.add({ poke() { vPos.set(THREE.MathUtils.randFloatSpread(800), 400, THREE.MathUtils.randFloatSpread(800)) } }, 'poke').name('⚡ poke')
})

onUnmounted(() => gui?.destroy())

// ────────────────────────────────────────────────────────────────────────────────
// 5.  SPIN + FRAME LOOP
// ────────────────────────────────────────────────────────────────────────────────
const { onBeforeRender } = useLoop()
let spin = 0 // keeps track of absolute spin so spring operates on offsets only

onBeforeRender(({ delta }) => {
  const dt = delta

  // Continuous spin
  spin += dt * 0.5
  pivot.rotation.y = spin + vRot.y // vRot.y is the springy offset

  // Spring position, rotation (offsets), scale
  dampVector3(pivot.position, HOME.pos, vPos, spring.stiffness, spring.damping, dt)

  // Rotation: we damp offset Euler (vRot) toward zero, then add to spin later
  const offsetEuler = new THREE.Euler(vRot.x, vRot.y, vRot.z, 'YXZ')
  dampEuler(offsetEuler, HOME.rot, vRot, spring.stiffness, spring.damping, dt)
  vRot.set(offsetEuler.x, offsetEuler.y, offsetEuler.z)

  // Apply updated offsets on top of base spin
  pivot.rotation.x = vRot.x
  pivot.rotation.y = vRot.y + spin
  pivot.rotation.z = vRot.z

  // Scale (rarely used but nice to have)
  dampVector3(pivot.scale, HOME.scl, vScl, spring.stiffness, spring.damping, dt)
})
</script>

<template>
  <!-- Always centred in scene; any external forces will settle back smoothly -->
  <primitive :object="pivot" />
</template>
