<!-- components/SimpleNeshanMap.client.vue -->
<template>
  <div class="w-[95vw] left-[0vw] right-[0vw] h-[60vh] rounded-xl overflow-hidden">
    <!-- only mount once mapbox-vue & composable are ready -->
    <component v-if="MapComponent && mapTypes && nmp" :is="MapComponent" :options="mapOptions"
      :map-setter="handleMap" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, onMounted } from 'vue'
import '@neshan-maps-platform/mapbox-gl-vue/dist/style.css'
import('@neshan-maps-platform/mapbox-gl-vue')
import('@neshan-maps-platform/mapbox-gl')
import { useMapRoutes } from '@/composables/useMapRoutes'
import lottie from 'lottie-web'

/* ─────── Constants ─────── */

const ipmLonLat: [number, number] = [51.3964, 35.7324] // [lng, lat]

const routeFiles = [
  '/routes/route_aghdasieh_metro.json',
  '/routes/route_nobonyad_metro.json',
  '/routes/route_gheitariyeh_metro.json',
  '/routes/route_tajrish_metro.json',
  '/routes/route_bike.json',
  '/routes/route_brt.json',
  '/routes/route_drive.json',
  '/routes/route_walk.json',
  '/routes/route_wheelchair.json'
]
const { routes, loading, error } = useMapRoutes(routeFiles)

/* ─────── Types & Props ─────── */

interface MarkerDef {
  coords: [number, number]   // [lng, lat]
  label: string
  svg: string
  popupHtml: string
}
interface RouteDef {
  id: string
  type: string
  origin: [number, number]       // [lat, lng]
  destination: [number, number]  // [lat, lng]
  color: string
  popupHtml: string
  geojson?: any

  /* internal fields used at runtime */
  __lottieElement?: HTMLElement
  __originLonLat?: [number, number]
  __destLonLat?: [number, number]
}
const props = defineProps<{
  apiKey: string
  markers: MarkerDef[]
  routes: RouteDef[]
  initialCenter: [number, number]
  initialZoom: number
}>()

/* ─────── mapbox-vue bindings ─────── */

const MapComponent = ref<any>(null)
const mapTypes = ref<any>(null)
const nmp = ref<any>(null)

/* ─────── Options passed to <MapComponent> ─────── */

const mapOptions = computed(() => ({
  mapKey: props.apiKey,
  mapType: mapTypes.value?.neshanVector,
  center: props.initialCenter,
  zoom: props.initialZoom,
  poi: false,
  traffic: false,
  doubleClickZoom: false,
  mapTypeControllerOptions: { show: false },
  isTouchPlatform: true
}))

/* ─────── Helper: build DOM for static icon+label markers ─────── */

function icon(url: string, label: string): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'marker-wrapper'

  const lbl = document.createElement('div')
  lbl.className = 'marker-label'
  lbl.textContent = label
  wrapper.appendChild(lbl)

  const ico = document.createElement('div')
  ico.className = 'marker-icon'
  ico.innerHTML = `<img src="${url}" width="24" height="24" draggable="false" />`
  wrapper.appendChild(ico)

  return wrapper
}

/* ────────────────────────────────────────────────────────────────
 * MAIN callback — fires once the map instance is ready
 * ──────────────────────────────────────────────────────────────── */
function handleMap(map: any) {
  /* 1️⃣  Static “points of interest” markers */
  props.markers.forEach(def => {
    const popup = new nmp.value.Popup({ offset: 25 }).setHTML(def.popupHtml)
    new nmp.value.Marker({ element: icon(def.svg, def.label) })
      .setLngLat(def.coords)      // [lng, lat]
      .setPopup(popup)
      .addTo(map)
  })


  /* Wait until route GeoJSONs are ready */
  if (loading.value) {
    map.once('idle', () => handleMap(map))
    return
  }
  if (error.value) {
    // eslint-disable-next-line no-console
    console.error(error.value)
    return
  }

  /* 2️⃣  Add a Lottie arrow at the midpoint of each route */
  routes.value.forEach(r => {
    /* convert origin/destination → [lng, lat] */
    const originLonLat: [number, number] = [r.origin[1], r.origin[0]]
    const destLonLat: [number, number] = ipmLonLat

    const midpoint: [number, number] = [
      (originLonLat[0] + destLonLat[0]) / 2,
      (originLonLat[1] + destLonLat[1]) / 2
    ]
    console.log(midpoint)
    new nmp.value.Marker({ color: '#f00' }) // red marker
      .setLngLat(midpoint)
      .addTo(map)



    /* 2a) OUTER wrapper that Mapbox will translate */
    const markerEl = document.createElement('div')
    markerEl.className = 'lottie-marker-wrapper'      // position handled by Mapbox

    /* 2b) INNER div that we will rotate */
    const lottieDiv = document.createElement('div')
    lottieDiv.className = 'lottie-arrow'              // width/height only
    markerEl.appendChild(lottieDiv)

    /* set up the Lottie animation */
    lottie.loadAnimation({
      container: lottieDiv,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/lotties/lottie-arrow-3.json'
    })

    /* 2c) place the midpoint marker */
    new nmp.value.Marker({ element: markerEl, anchor: 'center' })
      .setLngLat(midpoint)
      .addTo(map)

    /* 2d) place the START circle at the origin */
    new nmp.value.Marker({ color: r.color })
      .setLngLat(originLonLat)
      .setPopup(new nmp.value.Popup({ offset: 25 }).setHTML(r.popupHtml))
      .addTo(map)

    /* 2e) stash refs for later */
    r.__lottieElement = lottieDiv
    r.__originLonLat = originLonLat
    r.__destLonLat = destLonLat
  })

  /* 3️⃣  update arrow bearing on move / zoom */
  map.on('move', () => updateLottieBearings(map))
  map.on('zoom', () => updateLottieBearings(map))
  updateLottieBearings(map)          // initial run
}

/* ─────── Helper: update the rotation of every Lottie arrow ─────── */
function updateLottieBearings(map: any) {
  routes.value.forEach(r => {
    if (!r.__lottieElement || !r.__originLonLat || !r.__destLonLat) return

    const originPx = map.project(r.__originLonLat)  // screen coords
    const destPx = map.project(r.__destLonLat)

    const dy = destPx.y - originPx.y
    const dx = destPx.x - originPx.x
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI

    r.__lottieElement.style.transform = `rotate(${angleDeg}deg)`
  })
}

/* ─────── Lazy-load mapbox-vue & mapbox-gl on mount ─────── */
onMounted(async () => {
  const mapboxVue = await import('@neshan-maps-platform/mapbox-gl-vue')
  MapComponent.value = mapboxVue.MapComponent
  mapTypes.value = mapboxVue.MapTypes

  const gl = await import('@neshan-maps-platform/mapbox-gl')
  nmp.value = gl.default || gl
})
</script>

<style>
/***** Static marker icon + label (unchanged) *****/
.marker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.marker-label {
  background: rgb(255, 255, 255);
  padding: 2px 6px;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  margin-bottom: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: 'IRANSansX-d4', sans-serif !important;
  color: #014439;
}

.marker-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  background-color: #014439;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.marker-icon:hover {
  transform: scale(1.2);
  margin-top: 8px;
  border: 0.5px solid white;
}

.marker-icon img {
  width: 24px;
  height: 24px;
  user-select: none;
}

/***** Glassmorphic popup styling (unchanged) *****/
.mapboxgl-popup {
  font-family: 'IRANSansX-d4', sans-serif !important;
}

.mapboxgl-popup-content {
  position: relative;
  padding: 2.5rem 1rem 1.25rem 1.25rem;
  background-color: #014439;
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  color: white;
  overflow: hidden;
  transform: translateY(1rem) scale(0.95);
  opacity: 0;
  animation: popupIn 0.35s ease-out forwards;
}

.mapboxgl-popup-content.closing {
  animation: popupOut 0.25s ease-in forwards;
}

@keyframes popupIn {
  0% {
    opacity: 0;
    transform: translateY(1rem) scale(0.95);
  }

  60% {
    opacity: 1;
    transform: translateY(0) scale(1.02);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes popupOut {
  to {
    opacity: 0;
    transform: translateY(1rem) scale(0.95);
  }
}


.mapboxgl-popup-tip {
  margin: -1px;
}

.mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
  /* border-bottom-color: #ffffff61 !important; */
  border-bottom-color: #014439 !important;

}

.mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
  /* border-right-color: #ffffff61 !important; */
  border-right-color: #014439 !important;

}

.mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
  /* border-left-color: #ffffff61 !important; */
  border-left-color: #014439 !important;

}

.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
  /* border-top-color: #ffffff61 !important; */
  border-top-color: #014439 !important;

}

.mapboxgl-popup-close-button {
  position: absolute;
  top: 0;
  right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  padding-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255 255 255 / 0.2);
  backdrop-filter: blur(6px);
  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  color: #111;
  cursor: pointer;
  transform: scale(1);
  transition: transform 200ms cubic-bezier(.4, 0, .2, 1), background 200ms ease;
}

.mapboxgl-popup-close-button:hover {
  background: rgba(255 255 255 / 0.3);
  transform: scale(1.15);
  color: white;
}

.mapboxgl-popup-close-button:active {
  transform: scale(0.92);
}

.mapboxgl-popup-close-button:focus {
  outline: none;
}

/***** Force the GL canvas to 50vh (instead of default 100%) *****/
.mapboxgl-canvas-container {
  height: 50vh;
}


/* Wrapper div that Mapbox translates (don't override its transform) */
.lottie-marker-wrapper {
  width: 80px;
  height: 80px;
  pointer-events: none;
  position: relative;
  transform-origin: center center;
}

/* Inner Lottie div (rotated manually) */
.lottie-arrow {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: center center;
  pointer-events: none;
  z-index: 9999;
}
</style>
