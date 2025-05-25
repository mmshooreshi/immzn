#!/usr/bin/env node
// fix-mixed-decls.js
import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'glob'
import { parse } from '@vue/compiler-sfc'
import { spawnSync } from 'node:child_process'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const rl = readline.createInterface({ input, output })

for (const file of await glob('**/*.vue', { ignore: 'node_modules/**' })) {
  const src = await readFile(file, 'utf8')
  const { descriptor } = parse(src)
  if (!descriptor.styles.length) continue

  let rewritten = src
  let changed    = false

  /* ── process style blocks *in reverse order* so offsets stay correct ── */
  const styleBlocks = descriptor.styles
    .filter(b => b.lang === 'scss')
    .toReversed()                      // Node 20+

  for (const block of styleBlocks) {
    const fixed = spawnSync('sass-migrator', ['mixed-decls', '-'], {
      input: block.content,
      encoding: 'utf8'
    }).stdout

    if (fixed === block.content) continue  // nothing to change here

    /* 1️⃣ find the exact start/end of the inner <style> contents */
    const startOfContent =
      block.loc.start.offset +            // start of <style …>
      src.slice(block.loc.start.offset).indexOf(block.content)

    const endOfContent = startOfContent + block.content.length

    /* 2️⃣ splice the migrated code back in */
    rewritten =
      rewritten.slice(0, startOfContent) +
      fixed +
      rewritten.slice(endOfContent)

    changed = true
  }

  if (!changed) continue

  /* ── show a coloured “diff -u” preview ── */
  const tmpOld = join(tmpdir(), 'old.vue')
  const tmpNew = join(tmpdir(), 'new.vue')
  await Promise.all([writeFile(tmpOld, src), writeFile(tmpNew, rewritten)])

  try {
    const diff = execSync(`diff -u --color=always ${tmpOld} ${tmpNew}`, {
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString()
    console.log(`\n\x1b[1m${file}\x1b[0m`)
    console.log(diff || '(only whitespace changes)')
  } catch { /* diff exits 1 when files differ – ignore */ }

  const ans = (
    await rl.question('Apply changes? [y/N] ')
  ).trim().toLowerCase()

  if (ans === 'y' || ans === 'yes') {
    await writeFile(file, rewritten)
    console.log('✔ Saved\n')
  } else {
    console.log('✘ Skipped\n')
  }
}

await rl.close()
