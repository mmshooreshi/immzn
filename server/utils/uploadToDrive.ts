
// ───────────────────────────────────────────────────────────
// server/utils/uploadToDrive.ts   ← "google driver part"
// ───────────────────────────────────────────────────────────
import { google } from 'googleapis'
import { Readable } from 'node:stream'
import { useRuntimeConfig } from '#imports'

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mime: string = 'application/pdf'
) {
  /* 1. OAuth2 client using refresh‑token flow */
  const cfg = useRuntimeConfig().google   // {clientId, clientSecret, refreshToken, driveFolderId}
  const oauth2 = new google.auth.OAuth2(cfg.clientId, cfg.clientSecret)
  oauth2.setCredentials({ refresh_token: cfg.refreshToken })

  /* 2. Google Drive SDK */
  const drive = google.drive({ version: 'v3', auth: oauth2 })

  /* 3. Upload */
  const { data } = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [cfg.driveFolderId],
      mimeType: mime,
    },
    media: {
      mimeType: mime,
      body: Readable.from(buffer),
    },
    fields: 'id, name, webViewLink',
  })
  return data   // { id, name, webViewLink }
}