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
    /* 4. Send data + CV to Telegram                                      */
    /* ------------------------------------------------------------------ */
    const tg = useRuntimeConfig().telegram
    const tgApi = (method: string) =>
        `https://aisland.co/my-unique-telegram-proxy/bot${tg.botToken}/${method}`
    // `https://api.telegram.org/bot${tg.botToken}/${method}`

    // 4-A – post the registration details (Markdown V2)
    const text = [
    `*New registration* \\#user\\_${md2(body.phone)}`,
    '',
    `*Name:* ${md2(body.name)}`,
    `*Email:* ${md2(body.email)}`,
    `*Phone:* \\+98${md2(body.phone)}`,
    `*Affiliation:* ${md2(body.affiliation)}`,
    `*Role:* ${md2(body.role)}`,
    `*Attendance:* ${md2(body.attendance)}`,
    `*Tracks:* ${md2((body.tracks || []).join(', ') || '—')}`,
    `*Newsletter:* ${body.newsletter ? 'Yes' : 'No'}`,
    ].join('\n')

    console.log(tg.chatIdGroup)
    
    const query = new URLSearchParams({
        chat_id:    tg.chatIdGroup,     // e.g. "-1002595480314"
        text,
        parse_mode: 'MarkdownV2'
        })

    await $fetch(`${tgApi('sendMessage')}?${query.toString()}`)   // ← GET


    // 4-B – upload the CV as a file (multipart/form-data)
    const form = new FormData()
    form.append('chat_id', tg.chatIdGroup)
    form.append('caption', `\\#user\\_${md2(body.phone)}`)
    form.append('parse_mode','MarkdownV2')


    
    form.append(
    'document',
    new Blob([pdfBuffer], { type: 'application/pdf' }),
    body.cvFileName
    )

    await $fetch(tgApi('sendDocument'), { method: 'POST', body: form })
    /* ------------------------------------------------------------------ */
    /* 5. Append the row to the sheet  (unchanged)                         */
    /* ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ */
  /* 5. All good – reply                                                */
  /* ------------------------------------------------------------------ */
  return {
    status: 'success',
    fileUrl: file.webViewLink,
  }
})


export function md2(text = '') {
  return text
    // First, unescape any improperly escaped characters to prevent double escaping
    .replace(/\\([_*[\]()~`>#+\-=|{}.!\\])/g, '$1')
    // Then escape all special characters again (correctly)
    .replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}





