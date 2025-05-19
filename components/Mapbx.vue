<script setup lang="ts">
// mapbx.vue

import { ref, watch, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
// import {
//     MapboxMap,
//     MapboxNavigationControl,
//     MapboxGeolocateControl,
//     useMapbox
// } from 'nuxt-mapbox'

// props: allow switching language if you want
const props = defineProps({
    lang: { type: String, default: 'fa' as 'fa' | 'en' },
    mapData: { type: Object }
})

/**— state —**/
const mapId = 'mapbx'
const activeTab = ref(props.mapData.tabs[0].id)
const currentStyle = ref(
    props.mapData.mapConfig.styles.find(s => s.id === props.mapData.mapConfig.defaultStyle)!.url
)
const options = ref({
    style: currentStyle.value,
    center: props.mapData.mapConfig.center,
    zoom: props.mapData.mapConfig.zoom
})

// refs for cleanup
let mapInstance: mapboxgl.Map | null = null
let markers: mapboxgl.Marker[] = []
let routeLayerId: string | null = null

/**— helper: clear old markers & route —**/
function clearMap() {
    markers.forEach(m => m.remove())
    markers = []
    if (routeLayerId && mapInstance?.getLayer(routeLayerId)) {
        mapInstance.removeLayer(routeLayerId)
        mapInstance.removeSource(routeLayerId)
        routeLayerId = null
    }
}

/**— render whatever’s in the active tab —**/
function renderTab() {
    if (!mapInstance) return
    clearMap()

    const tab = props.mapData.tabs.find(t => t.id === activeTab.value)!
    // — markers only
    if ('marker' in tab) {
        const m = tab.marker
        const el = document.createElement('div')
        el.className = 'custom-marker'
        el.setAttribute('role', 'button')
        el.setAttribute('tabindex', '0')
        el.setAttribute('aria-label', m.popupHtml[props.lang].replace(/<[^>]+>/g, ''))
        const marker = new mapboxgl.Marker(el)
            .setLngLat(m.coords)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(m.popupHtml[props.lang])
            )
            .addTo(mapInstance)
        // keyboard support
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') marker.togglePopup()
        })
        markers.push(marker)
        mapInstance.flyTo({ center: props.mapData.mapConfig.center, zoom: props.mapData.mapConfig.zoom })
        return
    }

    // — single route
    if ('route' in tab) {
        const r = tab.route
            // origin & destination markers
            ;[
                { coords: r.origin, label: tab.title[props.lang] === props.mapData.tabs[0].title[props.lang] ? '' : mapData.tabs.find(t => t.id === 'location')!.marker.popupHtml[props.lang] }
            ].forEach(_ => { }) // we only show popup on main marker; skip origin label

            // always add both markers:
            ;[
                { coords: r.origin, label: r.description[props.lang] },
                { coords: r.destination, label: r.description[props.lang] }
            ].forEach(({ coords, label }) => {
                const el = document.createElement('div')
                el.className = 'custom-marker'
                el.setAttribute('role', 'button')
                el.setAttribute('tabindex', '0')
                el.setAttribute('aria-label', label)
                const popup = new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<strong>${label}</strong>`)
                const marker = new mapboxgl.Marker(el)
                    .setLngLat(coords)
                    .setPopup(popup)
                    .addTo(mapInstance!)
                el.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') popup.addTo(mapInstance!)
                })
                markers.push(marker)
            })

        // draw the line
        routeLayerId = `route-${tab.id}`
        mapInstance.addSource(routeLayerId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [r.origin, r.destination]
                }
            }
        })
        mapInstance.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeLayerId,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': r.color, 'line-width': 4 }
        })

        // hover + click
        mapInstance.on('mouseenter', routeLayerId, () => {
            mapInstance!.setPaintProperty(routeLayerId!, 'line-width', 6)
            mapInstance!.getCanvas().style.cursor = 'pointer'
        })
        mapInstance.on('mouseleave', routeLayerId, () => {
            mapInstance!.setPaintProperty(routeLayerId!, 'line-width', 4)
            mapInstance!.getCanvas().style.cursor = ''
        })
        mapInstance.on('click', routeLayerId, e => {
            new mapboxgl.Popup({ offset: 10 })
                .setLngLat(e.lngLat)
                .setText(r.description[props.lang])
                .addTo(mapInstance!)
        })

        // fit bounds
        const bounds = new mapboxgl.LngLatBounds(r.origin, r.origin)
        bounds.extend(r.destination)
        mapInstance.fitBounds(bounds, { padding: 50 })

        return
    }
}

//— initialise map & controls once ready —//
useMapbox(mapId, map => {
    mapInstance = map
    renderTab()
})

onMounted(() => {
    // style / center / zoom react to currentStyle if you want:
    watch(currentStyle, s => {
        options.value.style = s
        mapInstance?.setStyle(s)
    })
})

// when tab changes
watch(activeTab, () => renderTab())
</script>

<template>
    <section class="space-y-4">
        <!-- headline & address -->
        <div>
            <h2 class="text-2xl font-bold">{{ mapData.headline[props.lang] }}</h2>
            <p class="text-gray-700 dark:text-gray-300">{{ mapData.address[props.lang] }}</p>
        </div>

        <!-- style chooser & tabs -->
        <div class="flex flex-wrap gap-2">
            <select v-model="currentStyle" aria-label="انتخاب سبک نقشه" class="px-3 py-1 border rounded">
                <option v-for="s in mapData.mapConfig.styles" :key="s.id" :value="s.url">{{ s.title[props.lang] }}
                </option>
            </select>

            <div role="tablist" class="flex gap-1">
                <button v-for="t in mapData.tabs" :key="t.id" role="tab" :aria-selected="activeTab === t.id"
                    @click="activeTab = t.id" class="px-4 py-2 rounded focus:outline-none focus:ring 
                 " :class="activeTab === t.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700'">{{ t.title[props.lang] }}</button>
            </div>
        </div>

        <!-- the map -->
        <MapboxMap :map-id="mapId" style="width:100%; height:500px" :options="options">
            <MapboxNavigationControl v-if="mapData.mapConfig.controls.navigation" position="top-right" />
            <MapboxGeolocateControl v-if="mapData.mapConfig.controls.geolocate" position="top-right" />
        </MapboxMap>

        <!-- textual directions -->
        <div v-if="mapData.tabs.find(t => t.id === activeTab).route" class="p-4 bg-gray-100 dark:bg-gray-800 rounded"
            role="region" aria-labelledby="directions-heading">
            <h3 id="directions-heading" class="font-semibold mb-2">
                {{mapData.tabs.find(t => t.id === activeTab).route.description[props.lang]}}
            </h3>
            <ol class="list-decimal list-inside space-y-1">
                <li v-for="(step, i) in mapData.tabs.find(t => t.id === activeTab).route.steps[props.lang]" :key="i">{{
                    step }}</li>
            </ol>
        </div>
    </section>
</template>

<style scoped>
.custom-marker {
    width: 24px;
    height: 24px;
    background-color: #014439;
    border-radius: 0.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-primary {
    background-color: #014439;
}
</style>
