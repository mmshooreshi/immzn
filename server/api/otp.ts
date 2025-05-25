/* ─── server/api/otp.ts ──────────────────────────────────────────────── */
import { defineEventHandler, readBody, setCookie } from 'h3'

const mem = new Map<string, string>()   // phone → code

export default defineEventHandler(async (e) => {
  const { phone, code } = await readBody(e)

  /* 1️⃣ Send code (mock) */
  if (phone && !code) {
    const otp = (Math.random() * 9e5 + 1e5 | 0).toString()
    mem.set(phone, otp)
    console.log(`[MOCK-SMS.ir] ${phone} → ${otp}`)
    return { status: 'sent' }
  }

  /* 2️⃣ Verify */
  if (phone && code) {
    const ok = mem.get(phone) === code
    if (ok) {
      mem.delete(phone)
      setCookie(e, 'session', phone, { httpOnly: true })
      return { status: 'ok' }
    }
    return { status: 'invalid' }
  }

  return { status: 'error' }
})
