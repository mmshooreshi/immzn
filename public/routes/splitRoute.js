// splitRoutesWithDirections.js

const fs = require('fs');
const path = require('path');

// If your Node version doesn’t support global fetch, install node-fetch:
// import fetch from 'node-fetch';
const NESHAN_API_KEY='service.47cca61621c24938a10e18d375d73179'
const CONFIG_FILE = path.join(__dirname, '../data/home/2_map.json');
const API_KEY     = NESHAN_API_KEY;
if (!API_KEY) {
  console.error('❌ Please set NESHAN_API_KEY in your environment.');
  process.exit(1);
}

async function main() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ config.json not found.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  if (!Array.isArray(config.routes)) {
    console.error('❌ No "routes" array in config.json.');
    process.exit(1);
  }

  for (const route of config.routes) {
    const { origin, destination, id } = route;
    const url = new URL('https://api.neshan.org/v4/direction');
    url.searchParams.set('type', 'car');
    url.searchParams.set('origin', `${origin[1]},${origin[0]}`);       // lat,lng
    url.searchParams.set('destination', `${destination[1]},${destination[0]}`);
    url.searchParams.set('avoidTrafficZone', 'false');
    url.searchParams.set('avoidOddEvenZone', 'false');
    url.searchParams.set('alternative', 'false');

    console.log(`➡️  Fetching directions for ${id}…`);
    const res = await fetch(url.toString(), {
      headers: { 'api-key': API_KEY }
    });
    if (!res.ok) {
      console.error(`❌ Failed for ${id}:`, res.status, await res.text());
      continue;
    }

    const directionsPayload = await res.json();
    // Merge into the route object
    const enriched = { ...route, directions: directionsPayload.routes };

    const outFile = path.join(__dirname, `${id}.json`);
    fs.writeFileSync(outFile, JSON.stringify(enriched, null, 2), 'utf8');
    console.log(`✅ Written ${outFile}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
