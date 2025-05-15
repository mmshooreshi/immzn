import { reactive } from 'vue';

/** Load all JSON files eagerly from /data/home */
const localFiles = import.meta.glob('~/data/home/*.json', { eager: true });

/** Convert dash-case to camelCase */
const toCamelCase = (s: string) =>
  s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Remove leading number and underscore/dash */
const cleanKey = (s: string) => s.replace(/^\d+[-_]/, '');

/** Recursively prefix strings in fallback data with '*' for debug */
const markFallback = (obj: any): any => {
  if (typeof obj === 'string') return `*${obj}`;
  if (Array.isArray(obj)) return obj.map(markFallback);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, markFallback(value)]),
    );
  }
  return obj;
};

/** Build reactive store */
const data = reactive({} as Record<string, any>);

/** Initialize with local defaults for debug/fallback */
Object.entries(localFiles).forEach(([path, file]) => {
  const filename = path.split('/').pop()?.replace('.json', '') as string;
  const key = toCamelCase(cleanKey(filename));
  const localData = (file as { default: any }).default;
  data[key] = markFallback(localData);
});

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

const fetchRemoteData = async () => {
  const filenames = localEntries.map((e) => e.filename);
  console.log('filenames: ', filenames);

  await Promise.all(
    filenames.map(async (name) => {
      const key = toCamelCase(cleanKey(name));
      try {
        const response = await fetch(`/api/data/${name}`);
        if (!response.ok) throw new Error(`Failed to fetch ${name}`);
        const json = await response.json();
        data[key] = json;
      } catch (err) {
        console.warn(`Could not fetch remote ${name}, using local fallback`);
        const localEntry = localEntries.find((e) => e.filename === name);
        if (localEntry) {
          const fallback = localEntry.file.default;
          data[key] = markFallback(fallback);
        }
      }
    }),
  );
};

const init = async () => {
  await fetchRemoteData();
};

init();

export const useData = () => data;
