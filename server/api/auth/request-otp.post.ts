import { assertGuest } from '~/server/utils/auth-helpers'
import { assertRateLimit } from '~/server/utils/rate-limit'
import { getRequestIP } from 'h3'
import crypto from 'crypto'

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  assertGuest(event)
  const ip = getRequestIP(event) ?? 'unknown'
  console.log('OTP Request from IP:', ip)

  const { phone } = await readBody<{ phone: string }>(event)
  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: 'Missing phone number' })
  }

  // rate-limit: max 3 OTPs / phone / 10m
  await assertRateLimit(event, {
    key: `otp:${phone}`,
    max: 30,
    window: 60 * 10,
  })

  // generate a 6-digit code
  const otp = crypto.randomInt(100000, 999999).toString()

  if (config.smsMock == "true") {
    // in mock mode, just log and return
    console.log(`🔒 [MOCK SMS] OTP for ${phone}: ${otp}`)
    // store it so later validation still works
    await useStorage('redis').setItem(`otp:${phone}`, otp, { ttl: 300 })
    return { ok: true, mock: true }
  }

  // real SMS flow
  const payload = { to: phone }
  const url = `https://aisland.co/melipayamak/api/send/otp/${config.melipayamakApiKey}`
  // const url = `https://console.melipayamak.com/api/send/otp/${config.melipayamakApiKey}`

  // helper: fetch with timeout
  async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs = 10_000) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(id)
    }
  }

  let lastError: any
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        if (res.status >= 500 && res.status < 600 && attempt < 3) {
          await new Promise(r => setTimeout(r, attempt * 500))
          continue
        }
        throw createError({
          statusCode: res.status,
          statusMessage: res.statusText,
        })
      }

      const data = await res.json()
      if (!data.code) throw new Error('Missing OTP code in response')

      // store and return
      await useStorage('redis').setItem(`otp:${phone}`, data.code.toString(), { ttl: 300 })
      console.log('📨 OTP sent', { phone, code: data.code })
      return { ok: true }
    } catch (err: any) {
      lastError = err
      console.warn(`Attempt ${attempt} failed:`, err.message || err)
      if (
        (err.name === 'AbortError' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') &&
        attempt < 3
      ) {
        await new Promise(r => setTimeout(r, attempt * 500))
        continue
      }
      throw err
    }
  }

  throw createError({ statusCode: 502, statusMessage: lastError?.message || 'SMS send failed' })
})
