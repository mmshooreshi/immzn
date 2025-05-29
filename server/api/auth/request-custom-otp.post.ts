import { defineEventHandler, readBody, createError } from 'h3'
import { assertGuest } from '~/server/utils/auth-helpers'
import { assertRateLimit } from '~/server/utils/rate-limit'
import { getRequestIP } from 'h3'
import crypto from 'crypto'

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  // ensure the user is not authenticated
  assertGuest(event)

  // log client IP for monitoring
  const ip = getRequestIP(event) ?? 'unknown'
  console.log('📱 OTP Request from IP:', ip)

  // parse and validate phone number
  const { phone } = await readBody<{ phone: string }>(event)
  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: 'Missing phone number' })
  }

  // rate-limit: max 3 OTPs per phone every 10 minutes
  await assertRateLimit(event, {
    key: `otp:${phone}`,
    max: 30,
    window: 60 * 10,
  })

  // generate a secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString()

  // OTP message formatted for automatic detection (iOS & Android)
  // '<#>' prefix enables Android SMS Retriever, single-line pattern for iOS
  const text = `<#> کد تأیید شما: ${otp}`

  // store OTP in Redis for 5 minutes
  await useStorage('redis').setItem(`otp:${phone}`, otp, { ttl: 300 })

  // if mocking is enabled, log and skip actual send
  if (config.SMS_MOCK) {
    console.log(`🔒 [MOCK SMS] To=${phone}, Text="${text}"`)
    return { ok: true, mock: true }
  }

  // prepare payload for Melipayamak simple send endpoint
  const payload = {
    from: config.melipayamakSenderId,
    to: phone,
    text,
  }

  // direct Melipayamak API URL
  const url =
    `https://console.melipayamak.com/api/send/simple/${config.melipayamakApiKey}`

  // helper: fetch with timeout
  async function fetchWithTimeout(
    input: string,
    init: RequestInit,
    timeoutMs = 10000
  ) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(id)
    }
  }

  // attempt send with retry logic
  let lastError: any
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        // retry on 5xx
        if (res.status >= 500 && attempt < 3) {
          await new Promise(r => setTimeout(r, attempt * 500))
          continue
        }
        throw createError({ statusCode: res.status, statusMessage: res.statusText })
      }

      const data = await res.json() as { recId?: number; status?: string }
      if (!data.recId) {
        throw new Error(data.status || 'Failed to send SMS')
      }

      console.log('📨 SMS sent', { phone, otp, recId: data.recId })
      return { ok: true, recId: data.recId }
    } catch (err: any) {
      lastError = err
      console.warn(`Attempt ${attempt} failed:`, err.message || err)
      const recoverable =
        err.name === 'AbortError' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT'
      if (recoverable && attempt < 3) {
        await new Promise(r => setTimeout(r, attempt * 500))
        continue
      }
      throw err
    }
  }

  // all retries exhausted
  throw createError({ statusCode: 502, statusMessage: lastError?.message || 'SMS service unavailable' })
})