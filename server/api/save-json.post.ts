import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Loop through keys and write each one back to its JSON file
  const dir = join(process.cwd(), 'data/home')
  for (const key in body) {
    const filename = `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}.json`
    const path = join(dir, filename)
    await writeFile(path, JSON.stringify(body[key], null, 2), 'utf-8')
  }

  return { status: 'ok' }
})
