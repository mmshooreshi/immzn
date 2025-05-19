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
// const markerTpls = ref<InstanceType<typeof Icon>[]>([])
const markerTpls = ref<(HTMLImageElement | InstanceType<typeof Icon>)[]>([])


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

const markerTpl = ref()
function renderTab() {
    clearMap()
    const tabIndex = props.mapData.tabs.findIndex(t => t.id === activeTab.value)
    const tab = props.mapData.tabs[tabIndex]!

    // — pick the pre-rendered Icon component and clone its actual DOM node:

    const tplComp = markerTpls.value[tabIndex]
    // const el = (tplComp.$el as HTMLElement).cloneNode(true) as HTMLElement
    // — pick the right element (img or Icon.$el) and clone it
    let sourceEl: HTMLElement
    if (tplComp instanceof HTMLImageElement) {
        sourceEl = tplComp
    } else {
        sourceEl = tplComp.$el as HTMLElement
    }
    const el = sourceEl.cloneNode(true) as HTMLElement


    el.style.display = ''

    // un-hide the clone:
    el.style.display = ''

    if (tab.marker) {
        // position a single marker
        new mapboxgl.Marker({ element: el })
            .setLngLat(tab.marker.coords)
            .setPopup(
                new mapboxgl.Popup({
                    offset: 25, className: 'popup-cont'
                })
                    .setHTML(tab.marker.popupHtml)
            )
            .addTo(mapInstance!)
        return
    }



    if (tab.route) {
        const r = tab.route;

        // origin
        const originEl = el.cloneNode(true) as HTMLElement
        originEl.setAttribute('aria-label', tab.route.description)
        new mapboxgl.Marker({ element: originEl })
            .setLngLat(tab.route.origin)
            .addTo(mapInstance!)
        // dest
        const destEl = el.cloneNode(true) as HTMLElement
        destEl.setAttribute('aria-label', tab.route.description)
        new mapboxgl.Marker({ element: destEl })
            .setLngLat(tab.route.destination)
            .addTo(mapInstance!)
        // …then draw the line as before…
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


// //— initialise map & controls once ready —//
// useMapbox(mapId, map => {
//     mapInstance = map
//     renderTab()
// })

useMapbox(mapId, map => {
    mapInstance = map;

    // enable wheel/pinch zoom as you already do
    map.scrollZoom.enable();

    // then make sure the page never sees the wheel event:
    const canvasContainer = map.getCanvasContainer();
    canvasContainer.addEventListener(
        'wheel',
        e => {
            // prevent the wheel from ever reaching the document
            e.stopPropagation();
        },
        { passive: false }
    );

    renderTab();
});

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
    <section dir="ltr" class="space-y-4">
        <template v-for="(tab, i) in mapData.tabs" :key="tab.id">
            <!-- derive the URL inline -->
            <template
                v-if="(tab.marker?.iconUrl || tab.route?.originIconUrl || tab.route?.destinationIconUrl || '/icons/default-dest.svg').startsWith('/')">
                <img ref="markerTpls"
                    :src="tab.marker?.iconUrl || tab.route?.originIconUrl || tab.route?.destinationIconUrl || '/icons/default-dest.svg'"
                    class="marker-svg text-teal-600 shadow-lg w-8 h-8" style="display:none" aria-hidden="true" />
            </template>
            <template v-else>
                <Icon ref="markerTpls"
                    :name="tab.marker?.iconUrl || tab.route?.originIconUrl || tab.route?.destinationIconUrl || '/icons/default-dest.svg'"
                    class="marker-svg text-teal-600 shadow-lg w-8 h-8" style="display:none" aria-hidden="true" />
            </template>
        </template>
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

<style>
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

#mapbx {
    /* prevent the map’s scroll (wheel, touch) from ever scrolling the page */
    overscroll-behavior: contain;
    touch-action: none;

}

.popup-cont .mapboxgl-popup-content {
    --at-apply: bg-teal-800 rounded-xl shadow-lg text-teal-200 dark:text-teal-400 dark:text-gray-200 pt-8;
}

.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {

    --at-apply: border-t-teal-800 border-b-none;
}

.mapboxgl-popup-close-button {
    margin: 10px;
}


.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip {
    align-self: flex-start;
    border-bottom-color: #fff;
    border-right: none;
    border-top: none;
}
</style>
