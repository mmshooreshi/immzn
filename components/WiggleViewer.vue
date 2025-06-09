<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { WiggleBone } from 'wiggle'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const canvasRef = ref(null)

onMounted(() => {
  // Scene, Camera, Renderer setup
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, alpha: true })
  renderer.setSize(600, 600)

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 5, 5)
  scene.add(light)

  // Load GLTF
  const loader = new GLTFLoader()
  loader.load('/3d/white_mesh.glb', (gltf) => {
    let mesh
    gltf.scene.traverse((obj) => {
      console.log(obj)
    })

    // const mesh = gltf.scene.getObjectByName('SkinnedMesh')
    let rootBone
    const wiggleBones = []

    mesh.skeleton.bones.forEach((bone) => {
      if (!bone.parent.isBone) {
        rootBone = bone
      } else {
        const wiggleBone = WiggleBone(bone, { velocity: 0.5 })
        wiggleBones.push(wiggleBone)
      }
    })

    scene.add(gltf.scene)

    // Animation loop
    const animate = (ms) => {
      rootBone.position.x = Math.sin(ms * 0.001)
      wiggleBones.forEach((wiggleBone) => wiggleBone.update())
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate(0)
  })
})
</script>

<template>
  <canvas ref="canvasRef" width="600" height="600"></canvas>
</template>
