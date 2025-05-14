<!-- 
/*
=================================================================
📁  /components/UglyBunnyMatcap.vue — loads & stylises the GLTF asset
=================================================================*/ -->

<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import { useGLTF }     from '@tresjs/cientos'
import { useLoop, useTresContext }       from '@tresjs/core'
import { RGBELoader }                    from 'three-stdlib'

// ────────────────────────────────────────────────────────────────
// 1️⃣  Create a pivot so we can rotate the entire model easily
// ────────────────────────────────────────────────────────────────
const pivot = new THREE.Group()

// 2️⃣  Load the GLTF + Draco (auto‑detection) & attach to pivot
const { scene: model } = await useGLTF('/spline/scene.gltf', { draco: true })
pivot.add(model)

// 3️⃣  Grab Vue‑provided THREE scene so we can inject HDRI env‑map
const { scene: threeScene } = useTresContext()



// 4️⃣  Fetch a matcap for stylised specular highlights (optional)
// const { texture: matcap } = await useMatcapTexture('matcap_5')
const { matcap } = await useTexture({ matcap: '/textures/matcap0.png' })

onMounted(async () => {
  // — Center model inside its pivot so rotations are around origin
  const bbox   = new THREE.Box3().setFromObject(model)
  const center = bbox.getCenter(new THREE.Vector3())
  model.position.sub(center)

  // — Load a dim HDRI (but keep canvas alpha!)
  const hdr = await new Promise<THREE.Texture>((res, rej) =>
    new RGBELoader().setPath('/spline/').load('s.hdr', res, undefined, rej)
  )
  hdr.mapping = THREE.EquirectangularReflectionMapping
  // threeScene.value.environment = hdr // background remains transparent ✨

  // — Replace every material with our dark‑glass TransmissionMaterial
  const glassBase: THREE.MeshPhysicalMaterialParameters = {
    transparent:      true,
    transmission:     1,
    thickness:        0.282,
    ior:              0.282,
    roughness:        0.3,
    metalness:        0,
    color:            new THREE.Color(0x131313), // dark‑gray ≈ index 77
    envMapIntensity:  0.25,
  }

  model.traverse(obj => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh  = obj as THREE.Mesh

      const glass = new THREE.MeshMatcapMaterial({
        matcap: matcap,
        color: new THREE.Color(0x131353),

      })

      // const glass = new THREE.MeshMatcapMaterial({ ...glassBase })
      // glass.matcap = matcap // subtle specular pop
      glass.needsUpdate = true
      mesh.material = glass
      mesh.castShadow = false
      mesh.receiveShadow = false
    }
  })
})

// — Give the whole pivot a slow ambient spin
const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  pivot.rotation.y += delta * 0.2
})
</script>

<template>
  <primitive :object="pivot" />
</template>

