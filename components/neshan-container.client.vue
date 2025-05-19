<template>
  <div class="w-screen h-screen">
    <MapComponent
      :options="mapOptions"
      :map-setter="handleMap"
    />
  </div>
</template>


<script setup>
import { MapComponent, MapTypes } from '@neshan-maps-platform/mapbox-gl-vue'
import '@neshan-maps-platform/mapbox-gl-vue/dist/style.css'
import nmp_mapboxgl from '@neshan-maps-platform/mapbox-gl'

/* ---------- constants ---------- */
const OFFICE = [51.392610, 35.699967]                     // دفتر مرکزی
const PRINT  = [51.30858329680908, 35.67359353958164]     // چاپخانه
const ALL    = [(OFFICE[0]+PRINT[0])/2, (OFFICE[1]+PRINT[1])/2]  // میانهٔ دو نقطه

const mapRef = ref(null)

/* ---------- map setup ---------- */
const mapOptions = {
  mapKey: 'web.624bf8560ef44688b1b1d971027b361c',   // کلید نشن‌مپ
  mapType: MapTypes.neshanVector,
  center: ALL,
  zoom: 12,                                         // نمای پیش‌فرض: هر دو نقطه
  poi: false,
  traffic: false,

  /* ✋🏻 قفل کردن تعاملات ـ فقط کلیک مجاز است */
//   dragPan: false,
//   scrollZoom: false,
//   touchZoomRotate: false,
  doubleClickZoom: false,

  mapTypeControllerOptions: { show: false },
  isTouchPlatform: true,
  
}
//   mapTypeControllerStatus: { show: true, position: 'bottom-left' },

// mapKey: string;
//     poi?: boolean;
//     traffic?: boolean;
//     scale?: number;
//     mapType?: MapStyleNameType;
//     poiControllerOptions?: ControllerOptionsModel;
//     trafficControllerOptions?: ControllerOptionsModel;
//     mapTypeControllerOptions?: ControllerOptionsModel;
//     isTouchPlatform?: boolean;



/* small helper to build an <img>‑based marker */
// replace your old icon() with this at the top of <script setup>
function icon(url, label) {
  const wrapper = document.createElement('div');
  wrapper.className = 'marker-wrapper';

  // label above the icon
  const labelEl = document.createElement('div');
  labelEl.className = 'marker-label';
  labelEl.textContent = label;
  wrapper.appendChild(labelEl);

  // actual icon
  const iconEl = document.createElement('div');
  iconEl.className = 'marker-icon';
  iconEl.innerHTML = `<img src="${url}" width="24" height="24" draggable="false" />`;
  wrapper.appendChild(iconEl);

  return wrapper;
}

function handleMapOriginal(map) {
  mapRef.value = map

  const overview = { center: ALL, zoom: 12, speed: 1.2, curve: 1.4, essential: true };

  const officePopup2 = new nmp_mapboxgl.Popup({ offset: 25 })
  .setHTML(`
        <strong>دفتر مرکزی</strong><br/>
        میدان انقلاب، کارگر جنوبی، شهدای ژاندارمری، نرسیده به منیری جاوید، پلاک ۱۱۷ طبقه سوم،
        تلفن: 09361415413
      `);
const officeMarker2 = new nmp_mapboxgl.Marker({
    element: icon('https://api.iconify.design/mdi:domain.svg?color=white', 'دفتر مرکزی')
  })
  .setLngLat(OFFICE)
  .setPopup(officePopup2)
  .addTo(map);

officeMarker2.getElement().addEventListener('click', () => {
  map.flyTo({ center: OFFICE, zoom: 16, speed: 1.2, curve: 1.4, essential: true });
//   officePopup2.addTo(map);
});
officePopup2.on('close', () => map.flyTo({ center: ALL, zoom: 12, speed: 1.2, curve: 1.4, essential: true }));

// PRINT
const printPopup2 = new nmp_mapboxgl.Popup({ offset: 25 })
.setHTML(`
        <strong>چاپخانه</strong><br/>
        بزرگراه فتح، زیر پل شیر پاستوریزه<br/>
        ابتدای ۴۵ متری زرند، کوچه تلفن خانه، پلاک ۱۶۶<br/>
        تلفن: 66797911-3<br/>
        فکس: 66789577
      `);
const printMarker2 = new nmp_mapboxgl.Marker({
    element: icon('https://api.iconify.design/mdi:warehouse.svg?color=white', 'چاپخانه')
  })
  .setLngLat(PRINT)
  .setPopup(printPopup2)
  .addTo(map);

printMarker2.getElement().addEventListener('click', () => {
  map.flyTo({ center: PRINT, zoom: 16, speed: 1.2, curve: 1.4, essential: true });
//   printPopup2.addTo(map)
});
printPopup2.on('close', () => map.flyTo({ center: ALL, zoom: 12, speed: 1.2, curve: 1.4, essential: true }));

const allMarkers = [officeMarker2, printMarker2];
map.on('zoom', () => {
  const z = map.getZoom();
  allMarkers.forEach(marker => {
    // find the inner .marker-icon wrapper
    const ico = marker.getElement().querySelector('.marker-icon');
    if (!ico) return;
    if (z > 13) {
      ico.classList.add('compact');
    } else {
      ico.classList.remove('compact');
    }
  });
});



  /* ↩️ Double‑click anywhere → overview (zoom 12) */
  map.on('dblclick', () => {
    map.flyTo({ center: ALL, zoom: 12, speed: 1.2, curve: 1.4, essential: true })
    officeMarker2.getPopup()?.remove()
    printMarker2.getPopup()?.remove()
  })
}

function handleMap(map) {
  /* expose it if you need it elsewhere */
  mapRef.value = map;

  /* overview position used by several handlers */
  const overview = {
    center: ALL,
    zoom:   11,
    speed:  3,
    curve:  1.5,
    essential: true
  };

  /* ---------- marker definitions ---------- */
  const defs = [
    {
      coords: OFFICE,                     // [lng, lat]
      label:  'دفتر مرکزی',
      svg:    'mdi:domain',
      popup: `
        <strong>دفتر مرکزی</strong><br/>
        میدان انقلاب، کارگر جنوبی، شهدای ژاندارمری، نرسیده به منیری جاوید، پلاک ۱۱۷ طبقه سوم
        <br/>تلفن: 09361415413
      `
    },
    {
      coords: PRINT,
      label:  'چاپخانه',
      svg:    'mdi:warehouse',
      popup: `
        <strong>چاپخانه</strong><br/>
        بزرگراه فتح، زیر پل شیر پاستوریزه، ابتدای ۴۵ متری زرند، کوچه تلفن خانه، پلاک ۱۶۶
        تلفن: 66797911‑3<br/>
        فکس: 66789577
      `
    }
  ];

  /* ---------- build markers & pop‑ups ---------- */
  const markers = defs.map(def => {
    const originalUrl = `https://api.iconify.design/${def.svg}.svg?color=white`;

    const popup = new nmp_mapboxgl
      .Popup({ offset: 25 })
      .setHTML(def.popup)
      .on('close', () => map.flyTo(overview));

    const marker = new nmp_mapboxgl.Marker({
      element: icon(originalUrl, def.label)
    })
      .setLngLat(def.coords)
      .setPopup(popup)
      .addTo(map);

      
    /* click‑behaviour: popup when normal, Google Maps when compact */
    const iconEl = marker.getElement().querySelector('.marker-icon');
    iconEl.addEventListener('click', ev => {
      ev.stopPropagation();                       // keep map from also firing
      if (iconEl.classList.contains('compact')) {
        /* Google Maps wants lat,lng (note the order switch) */
        const [lng, lat] = def.coords;
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
          '_blank',
          "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800"

        );
      } else {
        popup.addTo(map);
        map.flyTo({
          center: def.coords,
          zoom:   16,
          speed:  2,
          curve:  1.5,
          essential: true
        });
      }
    });

    return { marker, iconEl, originalUrl };
  });

  /* ---------- zoom handler: toggle compact mode & swap SVG ---------- */
  map.on('zoom', () => {
    const z = map.getZoom();
    markers.forEach(({ iconEl, originalUrl }) => {
      if (z > 13) {
        if (!iconEl.classList.contains('compact')) {
          iconEl.classList.add('compact');
          iconEl.innerHTML = `
            <img src="https://api.iconify.design/mdi:directions.svg?color=white"
                 width="24" height="24" draggable="false" />
          `;
        }
      } else {
        if (iconEl.classList.contains('compact')) {
          iconEl.classList.remove('compact');
          iconEl.innerHTML = `
            <img src="${originalUrl}"
                 width="24" height="24" draggable="false" />
          `;
        }
      }
    });
  });

  /* ---------- double‑click anywhere → reset view & close popups ---------- */
  map.on('dblclick', () => {
    map.flyTo(overview);
    markers.forEach(({ marker }) => marker.getPopup()?.remove());
  });
}


definePageMeta({ name: 'neshan', layout: 'd' })
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
  border-radius: 0.75rem;           /* smooth, not a full circle */
  /* background: rgba(255, 255, 255, 0.723);   */
  background-color: #014439;
  backdrop-filter: blur(8px);       /* frosted-glass blur */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;             /* allow clicks here */
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.marker-icon:hover{
    transform: scale(1.2);
    margin-top: 8px;
    border: 0.5px solid white;

}

.marker-icon img{ width:24px; height:24px; user-select:none }



/* reset */

html, body {
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
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
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
  0%   { opacity: 0; transform: translateY(1rem) scale(0.95); }
  60%  { opacity: 1; transform: translateY(0) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes popupOut {
  to { opacity: 0; transform: translateY(1rem) scale(0.95); }
}

.mapboxgl-popup-tip{
    margin: -1px;
}
.mapboxgl-popup-anchor-top .mapboxgl-popup-tip{
  /* border-bottom-color: #ffffff61 !important; */
  border-bottom-color: #014439 !important;
  
}

.mapboxgl-popup-anchor-left .mapboxgl-popup-tip{
  /* border-right-color: #ffffff61 !important; */
  border-right-color: #014439 !important;

}
.mapboxgl-popup-anchor-right .mapboxgl-popup-tip{
  /* border-left-color: #ffffff61 !important; */
  border-left-color: #014439 !important;

}
.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip{
  /* border-top-color: #ffffff61 !important; */
  border-top-color: #014439 !important;

}
/* sleek close button */
.mapboxgl-popup-close-button {
  position: absolute;
  top: 0.75rem;
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
  transition: 
    transform 200ms cubic-bezier(.4,0,.2,1),
    background 200ms ease;
}

.mapboxgl-popup-anchor-right{
  flex-direction: row;
}

.mapboxgl-popup-anchor-left{
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
  width: 12px;           /* tiny dot */
  height: 12px;
  background: #014439;/* or pick your dot color */
  border-radius: 50%;
  box-shadow: none;     /* optional: remove shadow */
  padding: 0;           /* drop any padding */
  margin-top: 50px;
  margin-bottom: 50px;
}

.marker-icon.compact:hover {
  width: 40px;           /* tiny dot */
  height: 40px;
  background: #014439;/* or pick your dot color */
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: unset;           /* drop any padding */
  margin-top: 10px;
  margin-bottom: unset;
}



.marker-icon.compact img {
  display: none;        /* hide the SVG icon */
}

.marker-icon.compact:hover img {
  display: unset;        /* hide the SVG icon */
}

</style>
