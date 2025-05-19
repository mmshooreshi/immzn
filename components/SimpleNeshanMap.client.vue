// components/SimpleNeshanMap.client.vue
<template>
  <div class="w-full h-[60vh]">
    <component v-if="MapComponent && mapTypes && nmp" :is="MapComponent" :options="mapOptions"
      :map-setter="handleMap" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, onMounted } from 'vue'
import type { Feature, Geometry } from 'geojson'
import('@neshan-maps-platform/mapbox-gl-vue')
import('@neshan-maps-platform/mapbox-gl')

interface MarkerDef {
  coords: [number, number]
  label: string
  svg: string
  popupHtml: string
}
interface RouteDef {
  id: string
  type: string
  origin: [number, number]
  destination: [number, number]
  color: string
}

const props = defineProps<{
  apiKey: string
  markers: MarkerDef[]
  routes: RouteDef[]
  initialCenter: [number, number]
  initialZoom: number
}>()

const MapComponent = ref<any>(null)
const mapTypes = ref<any>(null)
const nmp = ref<any>(null)

const center = computed(() => props.initialCenter)
const zoom = computed(() => props.initialZoom)

const mapOptions = computed(() => ({
  mapKey: props.apiKey,
  mapType: mapTypes.value?.neshanVector,
  center: center.value,
  zoom: zoom.value,
  poi: false,
  traffic: false,
  doubleClickZoom: false,
  mapTypeControllerOptions: { show: false },
  isTouchPlatform: true
}))

function icon(url: string, label: string) {
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

function handleMap(map: any) {
  const overview = { center: center.value, zoom: zoom.value, speed: 1.4, curve: 1.4 }

  // add markers
  props.markers.forEach(def => {
    const popup = new nmp.value.Popup({ offset: 25 }).setHTML(def.popupHtml)
    const marker = new nmp.value.Marker({ element: icon(def.svg, def.label) })
      .setLngLat(def.coords)
      .setPopup(popup)
      .addTo(map)
  })

  // add routes
  props.routes.forEach(route => {
    // add as GeoJSON line
    map.addSource(route.id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [route.origin, route.destination] } as Geometry
      } as Feature
    })
    map.addLayer({
      id: route.id,
      type: 'line',
      source: route.id,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': route.color, 'line-width': 4 }
    })
  })

  // reset on double-click
  map.on('dblclick', () => {
    map.flyTo(overview)
    map.getContainer().querySelectorAll('.mapboxgl-popup').forEach((p: any) => p.remove())
  })
}

onMounted(async () => {
  const mapboxVue = await import('@neshan-maps-platform/mapbox-gl-vue')
  MapComponent.value = mapboxVue.MapComponent
  mapTypes.value = mapboxVue.MapTypes

  const gl = await import('@neshan-maps-platform/mapbox-gl')
  nmp.value = gl.default || gl
})
</script>


<style>
.marker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* allow clicks on the icon but not the label */
  pointer-events: none;
}

.marker-label {
  background: rgb(255, 255, 255);
  /* backdrop-filter: blur(8px); */
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
  /* smooth, not a full circle */
  /* background: rgba(255, 255, 255, 0.723);   */
  background-color: #014439;
  backdrop-filter: blur(8px);
  /* frosted-glass blur */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  /* allow clicks here */
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
  user-select: none
}



/* reset */

html,
body {
  margin: 0;
  padding: 0;
}

/* popup wrapper inherits your font */
.mapboxgl-popup {
  font-family: 'IRANSansX-d4', sans-serif !important;
}

/* glassmorphic popup box */
.mapboxgl-popup-content {
  position: relative;
  padding: 2.5rem 1rem 1.25rem 1.25rem;
  /* background: rgba(255, 255, 255, 0.15); */
  background-color: #014439;
  /* margin-block: -25px; */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  /* color: #111; */
  color: white;
  overflow: hidden;

  /* entry animation setup */
  transform: translateY(1rem) scale(0.95);
  opacity: 0;
  animation: popupIn 0.35s ease-out forwards;
}

/* closing animation */
.mapboxgl-popup-content.closing {
  animation: popupOut 0.25s ease-in forwards;
}

/* animated keyframes */
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

/* sleek close button */
.mapboxgl-popup-close-button {
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
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
  transition:
    transform 200ms cubic-bezier(.4, 0, .2, 1),
    background 200ms ease;
}

.mapboxgl-popup-anchor-right {
  flex-direction: row;
}

.mapboxgl-popup-anchor-left {
  flex-direction: row-reverse;
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
  /* box-shadow: 0 0 0 2px rgba(29 78 216 / 0.25); */
}

/* .mapboxgl-control-container{
    display: none;
} */


.marker-icon.compact {
  width: 12px;
  /* tiny dot */
  height: 12px;
  background: #014439;
  /* or pick your dot color */
  border-radius: 50%;
  box-shadow: none;
  /* optional: remove shadow */
  padding: 0;
  /* drop any padding */
  margin-top: 50px;
  margin-bottom: 50px;
}

.marker-icon.compact:hover {
  width: 40px;
  /* tiny dot */
  height: 40px;
  background: #014439;
  /* or pick your dot color */
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: unset;
  /* drop any padding */
  margin-top: 10px;
  margin-bottom: unset;
}



.marker-icon.compact img {
  display: none;
  /* hide the SVG icon */
}

.marker-icon.compact:hover img {
  display: unset;
  /* hide the SVG icon */
}

.mapboxgl-canvas-container {
  height: 50vh;
}
</style>
