// src/composables/useRoutes.js
import { ref, onMounted } from 'vue'
import polyline from '@mapbox/polyline'

/**
 * @param {string[]} routeFiles  – array of filenames (e.g. ['route_aghdasieh_metro.json', ...])
 */
export function useMapRoutes(routeFiles) {
console.log(routeFiles)
  const routes = ref([])      // will hold [{ id, geojson, color, origin, popupHtml }, …]
  const loading = ref(false)
  const error = ref(null)

  async function load() {
    loading.value = true
    try {
      const loaded = []
      for (const file of routeFiles) {
        const r = await fetch(file)
        if (!r.ok) throw new Error(`Failed to fetch ${file}: ${r.statusText}`)
        const data = await r.json()
    console.log(data)

        // take first directions alternative
        const dir = data.directions[0]
        // decode into [[lng,lat],…]
        const coords = polyline
          .decode(dir.overview_polyline.points, 5)
          .map(pt => pt.reverse())

        const geojson = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }]
        }

        loaded.push({
          id: data.id,
          geojson,
          color: data.color,
          origin: [...data.directions[0].legs[0].steps[0].start_location].reverse(),
          popupHtml: data.originPopupHtml || data.originPopupHtml?.fa || data.originPopupHtml?.en || '',
        })
      }
      routes.value = loaded
    } catch (e) {
      error.value = e
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { routes, loading, error }
}
