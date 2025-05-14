<script setup lang="ts">
import * as THREE from 'three'
import { onMounted } from 'vue'
import { useGLTF } from '@tresjs/cientos'
import { useLoop, useTresContext } from '@tresjs/core'
import { RGBELoader } from 'three-stdlib'

// — create your pivot group as before —
const pivot = new THREE.Group()

// — load the GLTF and attach it —
const { scene: model } = await useGLTF('/spline/scene.gltf', { draco: true })
pivot.add(model)

// — get the threejs scene so we can inject an HDRI —
const { scene: tresScene } = useTresContext()

onMounted(async () => {
  // 1️⃣ Center your model in the pivot
  const bbox = new THREE.Box3().setFromObject(model)
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  model.position.sub(center)

  // 2️⃣ Load an environment map for real reflections
  const hdr = await new Promise<THREE.Texture>((res, rej) =>
    new RGBELoader().setPath('/spline/').load('s.hdr', res, undefined, rej)
  )
  hdr.mapping = THREE.EquirectangularReflectionMapping
//   tresScene.value.environment = hdr

  // 3️⃣ Traverse every mesh and swap in a physical “glass” material with prismatic dispersion
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const mesh = o as THREE.Mesh
      const oldMat = mesh.material as THREE.MeshStandardMaterial

      const glass = new THREE.MeshPhysicalMaterial({
        // reuse your existing textures
        map:             oldMat.map,
        normalMap:       oldMat.normalMap,
        roughnessMap:    oldMat.roughnessMap,
        metalnessMap:    oldMat.metalnessMap,

        transparent:     true,
        transmission:    1,
        roughness:       0,
        metalness:       0,
        ior:             0.9,
        thickness:       0.2,
        envMapIntensity: 1.0,

        // ✨ Prism dispersion!
        clearcoat:                    1,
        clearcoatRoughness:           0,
        iridescence:                  1,
        iridescenceIOR:               1.3,
        iridescenceThicknessRange:    [100, 1000],
      })

      mesh.material = glass
      mesh.material.needsUpdate = true
    }
  })
})

// 4️⃣ Spin and “breathe” the pivot for a more natural animation
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  // steady yaw
  pivot.rotation.y = elapsed  * 0.5
  // gentle pitch & roll wiggle
//   pivot.rotation.x = Math.sin(elapsed * 0.3) * 0.2
//   pivot.rotation.z = Math.sin(elapsed * 0.2) * 0.1
})
</script>

<template>
  <!-- your environment is already set up per above -->
  <primitive :object="pivot" />
</template>
