import { reactive } from 'vue'

/** Load all JSON files eagerly from /data/home */
const files = import.meta.glob('~/data/home/*.json', { eager: true })

/** Convert dash-case to camelCase */
const toCamelCase = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())

/** Build reactive store */
const data = reactive({} as Record<string, any>)

const entries = Object.entries(files)
  .map(([path, file]) => {
    const filename = path.split('/').pop()?.replace('.json', '') || path
    return { path, file: file as { default: any }, filename }
  })
  .sort((a, b) => {
    const getNumber = (name: string) => {
      const match = name.match(/^(\d+)/)
      return match ? parseInt(match[1]) : Infinity
    }
    return getNumber(a.filename) - getNumber(b.filename)
  })

for (const { file, filename } of entries) {
  const key = toCamelCase(filename)
  data[key] = file.default
}

console.log(data)

export const useData = () => data
