// server/api/auth/verify-phone-otp.post.ts
import { readBody, createError, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
import { redis } from '~/server/utils/redisDeprecated'
import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // 1) read & validate
  const { phone, otp } = await readBody<{ phone: string; otp: string }>(event)
  if (!phone || !otp) {
    throw createError({ statusCode: 400, statusMessage: 'Phone and OTP required' })
  }

  // 2) verify OTP
  const stored = await redis.get(`otp:${phone}`)
  if (stored !== otp) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid OTP' })
  }
  // one‐time use
  await redis.del(`otp:${phone}`)

  // 3) upsert user by phone
  const sel = await db.query('SELECT id FROM users WHERE phone = $1', [phone])
  let userId: number
  if (sel.rowCount) {
    userId = sel.rows[0].id
  } else {
    const ins = await db.query(
      'INSERT INTO users(phone) VALUES($1) RETURNING id',
      [phone]
    )
    userId = ins.rows[0].id
  }

  // 4) issue JWT
  const token = jwt.sign({ id: userId }, useRuntimeConfig().jwtSecret, {
    expiresIn: '7d'
  })
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60
  })

  // 5) respond so your client can router.push
  return { success: true, userId }
})
