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

function renderTab() {
    clearMap();
    const tab = props.mapData.tabs.find(t => t.id === activeTab.value)!

    // 1️⃣ Single-marker tab
    console.log(tab)
    if (tab.marker) {
        const m = tab.marker;
        // create an <img> for the custom icon
        const img = document.createElement('img');
        img.src = m.iconUrl;
        img.alt = m.popupHtml.replace(/<[^>]+>/g, '');
        img.className = 'marker-img';
        // place the marker
        const marker = new mapboxgl.Marker({ element: img })
            .setLngLat(m.coords)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(m.popupHtml)
            )
            .addTo(mapInstance);
        // keyboard support
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                marker.togglePopup();
            }
        });
        markers.push(marker);

        // reset view
        mapInstance.flyTo({
            center: props.mapData.mapConfig.center,
            zoom: props.mapData.mapConfig.zoom
        });
        return;
    }

    // 2️⃣ Route tab (driving, walking, metro, wheelchair, etc.)
    if (tab.route) {
        const r = tab.route;

        // — origin marker
        if (r.originIconUrl) {
            const originImg = document.createElement('img');
            originImg.src = r.originIconUrl;
        } else {
            const originImg = document.createElement('Icon');
            originImg.name = "duo-icons:marker"
        }
        originImg.alt = r.description;
        originImg.className = 'marker-img';
        const originMarker = new mapboxgl.Marker({ element: originImg })
            .setLngLat(r.origin)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<strong>${r.originLabel || ''}</strong>`)
            )
            .addTo(mapInstance);
        originImg.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                originMarker.togglePopup();
            }
        });
        markers.push(originMarker);

        // — destination marker
        const destImg = document.createElement('img');
        destImg.src = r.destinationIconUrl || '/icons/default-dest.svg';
        destImg.alt = r.description;
        destImg.className = 'marker-img';
        const destMarker = new mapboxgl.Marker({ element: destImg })
            .setLngLat(r.destination)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<strong>${r.destinationLabel || ''}</strong>`)
            )
            .addTo(mapInstance);
        destImg.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                destMarker.togglePopup();
            }
        });
        markers.push(destMarker);

        // — draw the route line
        routeLayerId = `route-${tab.id}`;
        mapInstance.addSource(routeLayerId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [r.origin, r.destination]
                }
            }
        });
        mapInstance.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeLayerId,
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': r.color,
                'line-width': 4
            }
        });

        // — hover & click interactions
        mapInstance.on('mouseenter', routeLayerId, () => {
            mapInstance.setPaintProperty(routeLayerId, 'line-width', 6);
            mapInstance.getCanvas().style.cursor = 'pointer';
        });
        mapInstance.on('mouseleave', routeLayerId, () => {
            mapInstance.setPaintProperty(routeLayerId, 'line-width', 4);
            mapInstance.getCanvas().style.cursor = '';
        });
        mapInstance.on('click', routeLayerId, (e) => {
            new mapboxgl.Popup({ offset: 10 })
                .setLngLat(e.lngLat)
                .setText(r.description)
                .addTo(mapInstance);
        });

        // — fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds(r.origin, r.origin);
        bounds.extend(r.destination);
        mapInstance.fitBounds(bounds, { padding: 50 });

        return;
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
            <h2 class="text-2xl font-bold">{{ mapData.headline }}</h2>
            <p class="text-gray-700 dark:text-gray-300">{{ mapData.address }}</p>
        </div>

        <!-- style chooser & tabs -->
        <div class="flex flex-wrap gap-2">
            <select v-model="currentStyle" aria-label="انتخاب سبک نقشه" class="px-3 py-1 border rounded">
                <option v-for="s in mapData.mapConfig.styles" :key="s.id" :value="s.url">{{ s.title }}
                </option>
            </select>

            <div role="tablist" class="flex gap-1">
                <button v-for="t in mapData.tabs" :key="t.id" role="tab" :aria-selected="activeTab === t.id"
                    @click="activeTab = t.id" class="px-4 py-2 rounded focus:outline-none focus:ring 
                 " :class="activeTab === t.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700'">{{ t.title }}</button>
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
                {{mapData.tabs.find(t => t.id === activeTab).route.description}}
            </h3>
            <ol class="list-decimal list-inside space-y-1">
                <li v-for="(step, i) in mapData.tabs.find(t => t.id === activeTab).route.steps" :key="i">{{
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
