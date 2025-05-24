import { defineEventHandler, readBody, H3Error, createError } from 'h3'
import { google } from 'googleapis'
import { useRuntimeConfig } from '#imports'
import { Readable } from 'stream'

interface RegisterPayload {
  name: string
  email: string
  phone: string                 // “9123456789”
  affiliation: string
  role: string
  attendance: 'In-person' | 'Remote'
  tracks: string[]
  newsletter: boolean
  cvFileName: string
  cvBase64: string              // data:application/pdf;base64,xxxx
}

export default defineEventHandler(async (event) => {
  /* ------------------------------------------------------------------ */
  /* 1. Read + basic validation                                         */
  /* ------------------------------------------------------------------ */
  const body = (await readBody(event)) as Partial<RegisterPayload>

  const required = [
    'name', 'email', 'phone', 'affiliation',
    'role', 'attendance', 'tracks',
    'cvFileName', 'cvBase64'
  ] as const

  for (const key of required) {
    if (!body[key]) {
      throw createError({ statusCode: 400, statusMessage: `Missing field: ${key}` })
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Prepare Google OAuth2 client                                    */
  /* ------------------------------------------------------------------ */
  const cfg = useRuntimeConfig().google
  console.log(cfg)
  const oauth2 = new google.auth.OAuth2(
    cfg.clientId,
    cfg.clientSecret
  )
  oauth2.setCredentials({ refresh_token: cfg.refreshToken })

  // The client will lazily refresh the access-token when first used
  const drive   = google.drive({ version: 'v3', auth: oauth2 })
  const sheets  = google.sheets({ version: 'v4', auth: oauth2 })

  /* ------------------------------------------------------------------ */
  /* 3. Upload the CV                                                   */
  /* ------------------------------------------------------------------ */
  const base64 = (body.cvBase64 || '').split(',').pop()           // strip “data:…,”
  const pdfBuffer = Buffer.from(base64!, 'base64')
  const stream = Readable.from(pdfBuffer)

  const { data: file } = await drive.files.create({
    requestBody: {
      name: body.cvFileName,
      parents: [cfg.driveFolderId],
      mimeType: 'application/pdf',
    },
    media: {
      mimeType: 'application/pdf',
      body: stream,
    },
    fields: 'id, name, webViewLink',
  })

  /* ------------------------------------------------------------------ */
  /* 4. Append the row to the sheet                                     */
  /* ------------------------------------------------------------------ */
  const row = [
    body.name,
    body.email,
    `+98${body.phone}`,
    body.affiliation,
    body.role,
    body.attendance,
    (body.tracks || []).join(', '),
    body.newsletter ? 'Yes' : 'No',
    `https://drive.google.com/file/d/${file.id}`
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: cfg.spreadsheetId,
    range: 'FormResponses!A1',                  // top-left anchor
    valueInputOption: 'RAW',
    requestBody: {
      majorDimension: 'ROWS',
      values: [row],
    },
  })

  /* ------------------------------------------------------------------ */
  /* 5. All good – reply                                                */
  /* ------------------------------------------------------------------ */
  return {
    status: 'success',
    fileUrl: file.webViewLink,
  }
})
