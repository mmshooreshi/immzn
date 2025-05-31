
// ───────────────────────────────────────────────────────────
// server/api/upload-cv.post.ts ← **simplified, file‑only**
// ───────────────────────────────────────────────────────────
import { defineEventHandler, readBody, createError } from 'h3'
import { uploadToDrive } from '~/server/utils/uploadToDrive'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
    /* 1. Read + validate */
    const body = await readBody(event)
    const required = ['cvFileName', 'cvBase64']
    for (const k of required) {
        if (!body[k]) throw createError({ statusCode: 400, statusMessage: `Missing: ${k}` })
    }

    /* 2. decode base64 */
    const buffer = Buffer.from(String(body.cvBase64).split(',').pop(), 'base64')

    /* 3. Upload to Drive */
    const file = await uploadToDrive(buffer, body.cvFileName)

    /* 4. Optionally send to Telegram */
    if (body.sendToTelegram) {
        const cfg = useRuntimeConfig().telegram
        const text = `New CV uploaded: https://drive.google.com/file/d/${file.id}`
        const tgApi = (m: string) => `https://aisland.co/my-unique-telegram-proxy/bot${cfg.botToken}/${m}`

        // A. message
        await $fetch(tgApi('sendMessage'), {
            method: 'POST',
            body: { chat_id: cfg.chatIdGroup, text }
        })

        const blob = new Blob([buffer]);
        // B. document
        const form = new FormData()
        form.append('chat_id', cfg.chatIdGroup)
        form.append('document', blob, body.cvFileName)
        form.append('caption', text)
        await $fetch(tgApi('sendDocument'), { method: 'POST', body: form })
    }

    /* 5. Done */
    return { status: 'success', fileUrl: file.webViewLink }
})