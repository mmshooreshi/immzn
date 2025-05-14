// ~/composables/useLocalizedData.ts
import { computed } from 'vue';
import { useSettings } from './useSettings';
import { useData } from './useData';

/**
 * Recursively walk any structure (object or array) and:
 *  – If we find an object whose keys include the current locale and whose values are primitives,
 *    return just the value for that locale.
 *  – Otherwise, recurse into arrays/objects.
 *  – Logs each step for debugging.
 */
function localize<T>(value: any, locale: string, path: string = ''): T {
  //   console.debug(
  //     `[localize] Entering path: ${path}, value:`,
  //     value,
  //     `locale: ${locale}`,
  //   );

  if (Array.isArray(value)) {
    const result = value.map((item, index) =>
      localize(item, locale, `${path}[${index}]`),
    );
    // console.debug(`[localize] Array result at path: ${path}`, result);
    return result as any;
  }

  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value);
    // check if this object is exactly a locale–map (e.g. { en: "...", fa: "..." })
    if (
      keys.includes(locale) &&
      keys.every((k) => typeof value[k] === 'string')
    ) {
      const localizedValue = value[locale];
      //   console.debug(
      //     `[localize] Locale-specific value at path: ${path}`,
      //     localizedValue,
      //   );
      return localizedValue;
    }

    // otherwise, descend into each property
    const out: Record<string, any> = {};
    for (const k of keys) {
      out[k] = localize(value[k], locale, path ? `${path}.${k}` : k);
    }
    // console.debug(`[localize] Object result at path: ${path}`, out);
    return out as T;
  }

  // primitives pass through
  //   console.debug(
  //     `[localize] Primitive at path: ${path}, passing through:`,
  //     value,
  //   );
  return value as T;
}

export function useLocalizedData() {
  const { language } = useSettings(); // reactive `language` ref
  const raw = useData(); // your reactive data store

  // compute a full copy of the store, but with all en/fa maps replaced by the selected locale
  const localized = computed(() => {
    // console.debug(
    //   `[useLocalizedData] Recomputing localized data for language: ${language.value}`,
    // );
    const out: Record<string, any> = {};
    for (const key in raw) {
      //   console.debug(`[useLocalizedData] Localizing key: ${key}`);
      out[key] = localize(raw[key], language.value, key);
    }
    // console.debug('[useLocalizedData] Final localized object:', out);
    return out;
  });

  return localized;
}
