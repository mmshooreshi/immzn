// server/api/data/all.ts
import { defineEventHandler, sendError } from 'h3'
import { getOctokit } from '~/server/utils/octokit'
import { useRuntimeConfig } from '#imports'
import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  const config   = useRuntimeConfig()
  const dataMode = config.public.dataMode as 'local' | 'github'
  console.log("dataMode is:", dataMode)
  const result: Record<string, any> = {}

  // utility to transform "01-foo-bar.json" → "fooBar"
  const makeKey = (filename: string) =>
    filename
      .replace(/\.json$/, '')
      .replace(/^\d+[_-]?/, '')
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase())

  try {
    if (dataMode === 'local') {
      // ─── LOCAL: read from disk ────────────────────────────────────────────
      const dataDir = path.resolve(process.cwd(), 'data/home')
      const entries = await fs.readdir(dataDir)

      const jsonFiles = entries.filter((f) => f.endsWith('.json'))
      await Promise.all(
        jsonFiles.map(async (file) => {
          const fullPath = path.join(dataDir, file)
          const raw      = await fs.readFile(fullPath, 'utf-8')
          result[makeKey(file)] = JSON.parse(raw)
        })
      )
    } else {
      // ─── GITHUB: use your existing Octokit logic ─────────────────────────
      const githubRepo = 'mmshooreshi/immzn'
      const [owner, repo] = githubRepo.split('/')
      const octokit = getOctokit()

      // list files
      const { data: filesData } = await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        { owner, repo, path: 'data/home' }
      )
      if (!Array.isArray(filesData)) {
        throw new Error('Expected data/home to be a folder')
      }

      const jsonFiles = filesData
        .filter((f) => f.type === 'file' && f.name.endsWith('.json'))
        .map((f) => f.name)

      // fetch content in parallel
      await Promise.all(
        jsonFiles.map(async (filename) => {
          const { data: raw } = await octokit.request(
            'GET /repos/{owner}/{repo}/contents/{path}',
            {
              owner,
              repo,
              path: `data/home/${filename}`,
              headers: { Accept: 'application/vnd.github.v3.raw' }
            }
          )
          result[makeKey(filename)] = JSON.parse(raw as string)
        })
      )
    }

    return result
  } catch (err: any) {
    // automatic 500
    return sendError(
      event,
      createError({
        statusCode: err.status || 500,
        statusMessage: `Failed to load data: ${err.message}`
      })
    )
  }
})
