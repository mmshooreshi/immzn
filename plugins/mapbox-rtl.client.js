// plugins/mapbox-rtl.client.ts
import mapboxgl from 'mapbox-gl'

/**
 * Enable Right-to-Left text support in Mapbox GL JS.
 * This plugin must be loaded before any map instances are created.
 */
export default defineNuxtPlugin(() => {
  mapboxgl.setRTLTextPlugin(
    // Hosted plugin URL—can also point to your own copy
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
    () => {
      // Optional callback once the worker has loaded
      console.log('✅ mapbox-gl-rtl-text plugin loaded')
    },
    /* lazyLoad */ true
  )
})
