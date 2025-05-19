<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'
import { useLoop, useTres } from '@tresjs/core'
import { RGBELoader } from 'three-stdlib'

/**
 * Props – OrbitControls instance can be a ref or raw
 */
const props = defineProps<{ controls?: any }>()
const unwrap = (c: any) => (c && c.value ? c.value : c)

/* -------------------------------------------------------------------------- */
/* 1. SCENE & MODEL                                                           */
/* -------------------------------------------------------------------------- */
const pivot = new THREE.Group()
const { scene: model } = await useGLTF('/spline/scene.gltf', { draco: true })
pivot.add(model)

const { scene: tresScene } = useTres()
onMounted(() => tresScene.value.add(pivot))

/* HDRI glass material ------------------------------------------------------ */
onMounted(async () => {
  // centre model
  const box = new THREE.Box3().setFromObject(model)
  const center = new THREE.Vector3()
  box.getCenter(center)
  model.position.sub(center)

  // hdri
  const hdr = await new RGBELoader().setPath('/spline/').loadAsync('s.hdr')
  hdr.mapping = THREE.EquirectangularReflectionMapping
  tresScene.value.environment = hdr

  model.traverse(o => {
    if ((o as THREE.Mesh).isMesh) {
      const m = o as THREE.Mesh
      const old = m.material as THREE.MeshStandardMaterial
      m.material = new THREE.MeshPhysicalMaterial({
        map: old.map,
        normalMap: old.normalMap,
        roughnessMap: old.roughnessMap,
        metalnessMap: old.metalnessMap,
        transparent: true,
        transmission: 1,
        roughness: 0,
        metalness: 0,
        ior: 0.9,
        thickness: 0.25,
        envMapIntensity: 1.1,
      })
      m.material.needsUpdate = true
    }
  })
})

/* -------------------------------------------------------------------------- */
/* 2. SPRING‑BACK (bouncy)                                                    */
/* -------------------------------------------------------------------------- */
const HOME = {
  pos: new THREE.Vector3(10, 50, 0),
  rot: new THREE.Euler(0, 0, 0, 'YXZ'),
  scl: new THREE.Vector3(1, 1, 1),
}

const spring = reactive({ stiffness: 8, damping: 0.6 })
const vPos = new THREE.Vector3()
const vRot = new THREE.Euler()
const vScl = new THREE.Vector3()

function dampV3(cur: THREE.Vector3, tgt: THREE.Vector3, vel: THREE.Vector3, k: number, d: number, dt: number) {
  vel.x = (vel.x + (tgt.x - cur.x) * k * dt) * d
  vel.y = (vel.y + (tgt.y - cur.y) * k * dt) * d
  vel.z = (vel.z + (tgt.z - cur.z) * k * dt) * d
  cur.addScaledVector(vel, dt)
}

function dampEuler(cur: THREE.Euler, tgt: THREE.Euler, vel: THREE.Euler, k: number, d: number, dt: number) {
  const wrap = (a: number) => THREE.MathUtils.euclideanModulo(a + Math.PI, Math.PI * 2) - Math.PI
  const diffY = wrap(tgt.y - cur.y)
  vel.x = (vel.x + (tgt.x - cur.x) * k * dt) * d
  vel.y = (vel.y + diffY * k * dt) * d
  vel.z = (vel.z + (tgt.z - cur.z) * k * dt) * d
  cur.x += vel.x * dt
  cur.y += vel.y * dt
  cur.z += vel.z * dt
}

/* -------------------------------------------------------------------------- */
/* 3. Y‑AXIS BOOSTED SPIN                                                     */
/* -------------------------------------------------------------------------- */
const BASE_SPIN_Y = 1.5           // idle speed about Y
const DRAG_MULT_Y = 10_000        // huge boost while dragging
const spinSpeedY = ref(BASE_SPIN_Y)
function boostSpin() { spinSpeedY.value = BASE_SPIN_Y * DRAG_MULT_Y }
function resetSpin(ctrl: any) {
  spinSpeedY.value = BASE_SPIN_Y
  // smoothly reset camera back to its stored state
  ctrl?.reset?.()
}

/* attach / detach orbit‑control listeners */
function hook(ctrlMaybe: any) {
  const ctrl = unwrap(ctrlMaybe)
  if (!ctrl || !ctrl.addEventListener) return
  // make sure initial state is recorded so reset() works
  ctrl.saveState?.()
  ctrl.addEventListener('start', boostSpin)
  ctrl.addEventListener('end', () => resetSpin(ctrl))
}
function unhook(ctrlMaybe: any) {
  const ctrl = unwrap(ctrlMaybe)
  if (!ctrl || !ctrl.removeEventListener) return
  ctrl.removeEventListener('start', boostSpin)
  ctrl.removeEventListener('end', () => resetSpin(ctrl))
}

onMounted(() => hook(props.controls))
onUnmounted(() => unhook(props.controls))
watch(() => unwrap(props.controls), (n, o) => { unhook(o); hook(n) })

/* -------------------------------------------------------------------------- */
/* 4. HOVER / TAP IMPULSES (now smoother)                                     */
/* -------------------------------------------------------------------------- */
function rand(amp: number) { return THREE.MathUtils.randFloatSpread(amp) }

function hoverJump() {
  vPos.add(new THREE.Vector3(rand(40), rand(40), rand(40)))
  vRot.y += THREE.MathUtils.degToRad(6)
}

function tapJump() {
  vPos.add(new THREE.Vector3(rand(500), rand(500), rand(500)))
  vRot.y += THREE.MathUtils.degToRad(90 * (Math.random() - 0.5))
  vScl.set(rand(4), rand(4), rand(4))
}

/* -------------------------------------------------------------------------- */
/* 5. FRAME LOOP                                                              */
/* -------------------------------------------------------------------------- */
const { onBeforeRender } = useLoop()
let spinY = 0

onBeforeRender(({ delta }) => {
  const dt = delta
  spinY += dt * spinSpeedY.value

  // rotation: boosted yaw + springy offsets
  pivot.rotation.set(vRot.x, spinY + vRot.y, vRot.z)

  // spring‑back for pos / rot / scale
  dampV3(pivot.position, HOME.pos, vPos, spring.stiffness, spring.damping, dt)
  dampEuler(vRot, HOME.rot, vRot, spring.stiffness, spring.damping, dt)
  dampV3(pivot.scale, HOME.scl, vScl, spring.stiffness, spring.damping, dt)
})
</script>

<template>
  <!-- pointerenter / pointerdown for hover & tap -->
  <primitive :object="pivot" @pointerenter="hoverJump" @pointerdown="tapJump" />
</template>
