<script setup lang='ts'>
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'
import { onMounted } from 'vue'

const pivot = new THREE.Group()

const { scene: model } = await useGLTF('/spline/scene.gltf', { draco: true })
pivot.add(model)

// Center model
onMounted(() => {
  const bbox = new THREE.Box3().setFromObject(model)
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  model.position.sub(center)
})

// Swap in physical glass material
model.traverse(o => {
  if ((o as THREE.Mesh).isMesh) {
    const mesh = o as THREE.Mesh
    const oldMat = mesh.material as THREE.MeshStandardMaterial
    mesh.material = new THREE.MeshPhysicalMaterial({
      map: oldMat.map,
      normalMap: oldMat.normalMap,
      roughnessMap: oldMat.roughnessMap,
      metalnessMap: oldMat.metalnessMap,
      transparent: true,
      transmission: 1,
      roughness: 0,
      metalness: 0,
      ior: 1.3,
      thickness: 0.2,
      envMapIntensity: 0.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05
    })
    mesh.material.needsUpdate = true
  }
})

// Spin pivot
const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  pivot.rotation.y += delta * 0.5
})
</script>

<template>
  <primitive :object='pivot' />
</template>
