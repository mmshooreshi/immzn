<template>
    <div class="map-wrapper">
        <!-- style switcher & tabs -->
        <div class="flex flex-wrap mb-2 gap-2">
            <label>
                <span class="sr-only">انتخاب سبک نقشه</span>
                <select v-model="currentStyle" @change="changeStyle" class="px-3 py-1 border rounded text-sm"
                    aria-label="انتخاب سبک نقشه">
                    <option v-for="style in data.styles" :key="style.id" :value="style.url">
                        {{ style.title }}
                    </option>
                </select>
            </label>

            <div role="tablist" aria-label="انتخاب نوع نمایش روی نقشه" class="flex gap-1">
                <button v-for="tab in data.tabs" :key="tab.id" @click="setActive(tab.id)" :class="[
                    'px-4 py-2 rounded focus:outline-none focus:ring',
                    activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                ]" role="tab" :aria-selected="activeTab === tab.id" :tabindex="activeTab === tab.id ? 0 : -1">
                    {{ tab.title }}
                </button>
            </div>
        </div>

        <!-- map -->
        <div ref="mapContainer" class="w-full h-96 rounded-lg overflow-hidden" role="application" aria-label="نقشه"
            tabindex="0"></div>

        <!-- textual directions for screen readers & sighted -->
        <div v-if="currentRoute?.steps" class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded" role="region"
            aria-labelledby="directions-heading">
            <h2 id="directions-heading" class="text-lg font-semibold mb-2">
                {{ currentRoute.description }}
            </h2>
            <ol class="list-decimal list-inside space-y-1">
                <li v-for="(step, i) in currentRoute.steps" :key="i">
                    {{ step }}
                </li>
            </ol>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'

const props = defineProps({
    data: { type: Object, required: true }
})

const mapContainer = ref(null)
let map
let currentMarkers = []
let currentRouteLayerId = null

const activeTab = ref(props.data.tabs[0].id)
const currentStyle = ref(
    props.data.styles.find(s => s.id === props.data.defaultStyle)?.url ||
    props.data.styles[0].url
)

function clearMap() {
    currentMarkers.forEach(m => m.remove())
    currentMarkers = []
    if (currentRouteLayerId && map.getLayer(currentRouteLayerId)) {
        map.removeLayer(currentRouteLayerId)
        map.removeSource(currentRouteLayerId)
        currentRouteLayerId = null
    }
}

function renderTab(tab) {
    clearMap()

    // —— markers only
    if (tab.markers) {
        tab.markers.forEach(m => {
            const el = document.createElement('div')
            el.className = 'marker'
            el.setAttribute('role', 'button')
            el.setAttribute('tabindex', '0')
            el.setAttribute('aria-label', m.ariaLabel)
            const marker = new mapboxgl.Marker(el)
                .setLngLat(m.coords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(m.html))
                .addTo(map)
            // keyboard support: open popup on Enter
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    marker.togglePopup()
                }
            })
            currentMarkers.push(marker)
        })
        map.flyTo({ center: props.data.center, zoom: props.data.zoom })
        return
    }

    // —— single route (including wheelchair)
    if (tab.route) {
        const {
            origin,
            destination,
            originLabel,
            destinationLabel,
            destinationHtml,
            color,
            steps,
            description
        } = tab.route

        // origin & destination markers
        [
            { coords: origin, label: originLabel, html: null },
            { coords: destination, label: destinationLabel, html: destinationHtml || null }
        ].forEach(({ coords, label, html }) => {
            const el = document.createElement('div')
            el.className = 'marker'
            el.setAttribute('role', 'button')
            el.setAttribute('tabindex', '0')
            el.setAttribute('aria-label', label)
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(html || `<strong>${label}</strong>`)
            const marker = new mapboxgl.Marker(el)
                .setLngLat(coords)
                .setPopup(popup)
                .addTo(map)
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') popup.addTo(map)
            })
            currentMarkers.push(marker)
        })

        // draw line
        const layerId = `route-${tab.id}`
        map.addSource(layerId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: [origin, destination] }
            }
        })
        map.addLayer({
            id: layerId,
            type: 'line',
            source: layerId,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-width': 4, 'line-color': color }
        })
        currentRouteLayerId = layerId

        // hover & click
        map.on('mouseenter', layerId, () => {
            map.setPaintProperty(layerId, 'line-width', 6)
            map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', layerId, () => {
            map.setPaintProperty(layerId, 'line-width', 4)
            map.getCanvas().style.cursor = ''
        })
        map.on('click', layerId, e => {
            new mapboxgl.Popup({ offset: 10 })
                .setLngLat(e.lngLat)
                .setText(description)
                .addTo(map)
        })

        // fit to bounds
        const bounds = new mapboxgl.LngLatBounds(origin, origin)
        bounds.extend(destination)
        map.fitBounds(bounds, { padding: 50 })

        return
    }
}

function setActive(id) {
    activeTab.value = id
}

function changeStyle() {
    map.setStyle(currentStyle.value)
    map.once('styledata', () => {
        renderTab(props.data.tabs.find(t => t.id === activeTab.value))
    })
}

onMounted(() => {
    map = new mapboxgl.Map({
        container: mapContainer.value,
        style: currentStyle.value,
        center: props.data.center,
        zoom: props.data.zoom
    })

    // built-in controls
    if (props.data.controls.navigation) {
        map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    }
    if (props.data.controls.scale) {
        map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left')
    }
    if (props.data.controls.geolocate) {
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true
            }),
            'top-right'
        )
    }

    map.on('load', () => {
        renderTab(props.data.tabs.find(t => t.id === activeTab.value))
    })

    // double-click to reset
    map.on('dblclick', () => {
        clearMap()
        map.flyTo({ center: props.data.center, zoom: props.data.zoom })
    })
})

watch(activeTab, id => {
    const tab = props.data.tabs.find(t => t.id === id)
    if (map && map.isStyleLoaded()) {
        renderTab(tab)
    } else {
        map.once('load', () => renderTab(tab))
    }
})
</script>

<style scoped>
.map-wrapper {
    width: 100%;
}

.marker {
    width: 24px;
    height: 24px;
    background-color: #014439;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.bg-primary {
    background-color: #014439;
}
</style>