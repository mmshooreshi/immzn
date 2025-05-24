import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'glob'
import { parse } from '@vue/compiler-sfc'
import { spawnSync } from 'node:child_process'

for (const file of await glob('**/*.vue')) {
  const src = await readFile(file, 'utf8')
  const { descriptor } = parse(src)
  if (!descriptor.styles.length) continue

  let offset = 0
  let rewritten = src

  for (const block of descriptor.styles.filter(s => s.lang === 'scss')) {
    const fixed = spawnSync('sass-migrator', ['mixed-decls', '-'], {
      input: block.content,
      encoding: 'utf8'
    }).stdout

    // splice the fixed block back into the .vue file
    rewritten =
      rewritten.slice(0, block.loc.start.offset + offset) +
      fixed +
      rewritten.slice(block.loc.end.offset + offset)

    offset += fixed.length - block.content.length
  }

  await writeFile(file, rewritten)
  console.log('✔', file)
}
