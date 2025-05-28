// server/api/auth/request-phone-otp.post.ts
import { readBody, createError } from 'h3'
import { randomInt } from 'crypto'
import { redis } from '~/server/utils/redisDeprecated'

export default defineEventHandler(async (event) => {
  const { phone } = await readBody<{ phone: string }>(event)
  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: 'Phone required' })
  }

  const otp = String(randomInt(100000, 999999))
  await redis.set(`otp:${phone}`, otp, 'EX', 300)

  // → TODO: send `otp` via your phone/SMS provider
  console.log(`OTP for ${phone}: ${otp}`)

  // return a success flag for the client
  return { success: true }
})
