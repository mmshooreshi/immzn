// server/api/auth/request-otp.post.ts
import { randomInt } from 'crypto'
import { assertGuest } from '~/server/utils/auth-helpers'
import { assertRateLimit } from '~/server/utils/rate-limit'
import { getRequestIP }      from 'h3'

export default defineEventHandler(async (event) => {
  assertGuest(event)
  const ip = getRequestIP(event) ?? 'local'
  console.log('IP:', ip, event)

  if (!ip) throw createError({ statusCode: 400, statusMessage: 'IP not found' })

  const { phone } = await readBody<{ phone: string }>(event)

    // max 3 OTPs per phone every 10 minutes
  await assertRateLimit(event, {
    key   : `otp:${phone}`,
    max   : 3,
    window: 60 * 10
  })

  // max 10 OTP requests per IP per hour
  await assertRateLimit(event, {
    key   : `ip:${ip}`,
    max   : 10,
    window: 60 * 60
  })

  const otp       = randomInt(100_000, 999_999).toString()

  await useStorage('redis').setItem(`otp:${phone}`, otp, { ttl: 300 })
  $log.info('📨 OTP generated', { phone, otp })

  return { ok: true }
})