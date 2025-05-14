<!-- @/components/uglyBunny.vue -->

<script setup lang="ts">
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'
import { useLoop, useTresContext } from '@tresjs/core'
import { RGBELoader } from 'three-stdlib'

// — create your pivot group as before —
const pivot = new THREE.Group()

// — load the GLTF and attach it —
const { scene: model } = await useGLTF('/spline/scene.gltf', { draco: true })
pivot.add(model)

// — get the threejs scene so we can inject an HDRI —
const { scene: threeScene } = useTresContext()

onMounted(async () => {
  // 1️⃣ Center your model in the pivot
  const bbox = new THREE.Box3().setFromObject(model)
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  console.log(center)
  center.x=-140
  center.y=1400
  model.position.sub(center)

  // 2️⃣ Load an environment map for real reflections
  const hdr = await new Promise<THREE.Texture>((res, rej) =>
    new RGBELoader().setPath('/spline/').load('s.hdr', res, undefined, rej)
  )
  hdr.mapping = THREE.EquirectangularReflectionMapping
  threeScene.value.environment = hdr
  // threeScene.value.background  = hdr

  // 3️⃣ Traverse every mesh and swap in a physical “glass” material
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const mesh = o as THREE.Mesh
      const oldMat = mesh.material as THREE.MeshStandardMaterial

      // build a brand-new MeshPhysicalMaterial…
      const glass = new THREE.MeshPhysicalMaterial({
        // …but reuse whatever maps your GLTF came with:
        map:         oldMat.map,
        normalMap:   oldMat.normalMap,
        roughnessMap:oldMat.roughnessMap,
        metalnessMap:oldMat.metalnessMap,

        transparent: true,
        transmission: 1,  // full glass
        roughness:    0,  // perfectly smooth
        metalness:    0,
        ior:          0.9,  // typical glass IOR
        thickness:    0.2,  // gives it some volume
        envMapIntensity: 1.0

        
      })

      mesh.material = glass
      mesh.material.needsUpdate = true
    }
  })
})

// 4️⃣ Spin the pivot in place
const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  pivot.rotation.y += delta * 0.5
  
})
</script>



<template>
  <!-- your environment is already set up per my last message… -->
  <primitive :object="pivot" />
</template>
