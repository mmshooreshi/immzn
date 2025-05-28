import { defineEventHandler, readBody, setCookie } from 'h3'
import { randomUUID } from 'crypto'

interface OtpEntry {
  phone: string
  code: string
}

// otpId → { phone, code }
const mem = new Map<string, OtpEntry>()

// simple helper to introduce an artificial delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default defineEventHandler(async (e) => {
  const { phone, code, otpId } = await readBody<{ phone?: string; code?: string; otpId?: string }>(e)

  /* 1️⃣ Send code (mock) */
  if (phone && !code && !otpId) {
    const otp = (Math.random() * 9e5 + 1e5 | 0).toString()
    const id = randomUUID()
    mem.set(id, { phone, code: otp })
    console.log(`[MOCK-SMS.ir] ${phone} → ${otp} (otpId: ${id})`)

    // simulate network/SMS delay
    await delay(2000) // 2 seconds

    return { status: 'sent', otpId: id }
  }

  /* 2️⃣ Verify */
  if (otpId && code) {
    // optional: simulate verification delay (e.g., 500ms)
    await delay(100)
    const entry = mem.get(otpId)
    if (entry && entry.code === code) {
      mem.delete(otpId)
      setCookie(e, 'session', entry.phone, { httpOnly: true })
      await delay(500)
      return { status: 'ok' }
    }
    return { status: 'invalid' }
  }

  return { status: 'error' }
})
