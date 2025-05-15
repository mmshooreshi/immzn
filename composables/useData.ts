// useData.ts
import { reactive } from 'vue';

/** Load all JSON files eagerly from /data/home */
const localFiles = import.meta.glob('~/data/home/*.json', { eager: true });

/** Convert dash-case to camelCase */
const toCamelCase = (s: string) =>
  s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Build reactive store */
const data = reactive({} as Record<string, any>);

/** Extract sorted local filenames */
const localEntries = Object.entries(localFiles)
  .map(([path, file]) => {
    const filename = path.split('/').pop()?.replace('.json', '') || path;
    return { path, file: file as { default: any }, filename };
  })
  .sort((a, b) => {
    const getNumber = (name: string) => {
      const match = name.match(/^(\d+)/);
      return match ? parseInt(match[1]) : Infinity;
    };
    return getNumber(a.filename) - getNumber(b.filename);
  });

/** Fetch latest JSON files from Nuxt server API and update the reactive data */
const fetchRemoteData = async () => {
  const filenames = localEntries.map((e) => e.filename);

  await Promise.all(
    filenames.map(async (name) => {
      const key = toCamelCase(name);
      try {
        const response = await fetch(`/api/data/${name}`);
        if (!response.ok) throw new Error(`Failed to fetch ${name}`);
        const json = await response.json();
        data[key] = json;
      } catch (err) {
        console.warn(`Could not fetch remote ${name}, using local fallback`);
        const local = localEntries.find((e) => e.filename === name);
        if (local) data[key] = local.file.default;
      }
    }),
  );
};

await fetchRemoteData();

export const useData = () => data;
