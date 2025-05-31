
// ───────────────────────────────────────────────────────────
// server/api/team/upload-cv.post.ts  (Nitro server route)
// ───────────────────────────────────────────────────────────
import { google } from 'googleapis'
import { readBody, H3Event } from 'h3'
import { writeFile, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default defineEventHandler(async (event: H3Event) => {
  // 1. parse multipart
  const body = await readBody(event, { as: 'stream' }) as any
  const file = body.files.cv
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'CV missing' })
  }

  // 2. move to tmp so googleapis can read the stream twice if needed
  const tmpPath = join(tmpdir(), randomUUID() + '-' + file.name)
  await writeFile(tmpPath, await file.toBuffer())

  try {
    // 3. auth Google Drive
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.file']
    })
    const drive = google.drive({ version: 'v3', auth })

    // 4. upload
    const res = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!]
      },
      media: {
        mimeType: file.type,
        body: (await import('node:fs/promises')).createReadStream(tmpPath)
      },
      fields: 'id,webViewLink'
    })

    // 5. save URL to DB (pseudo‑code)
    // await prisma.team.update({ where:{ id:user.teamId }, data:{ cvUrl: res.data.webViewLink } })

    return {
      id: res.data.id,
      url: res.data.webViewLink
    }
  } finally {
    // 6. cleanup tmp
    await unlink(tmpPath).catch(() => { })
  }
})