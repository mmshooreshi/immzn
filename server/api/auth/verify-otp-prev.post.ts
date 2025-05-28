// /server/api/auth/verify-otp.post.ts
import { redis } from '~/server/utils/redisDeprecated'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { signJwt } from '~/server/utils/jwt'
import { setSecureCookie } from '~/server/utils/secure-cookie'
import { createAvatarUrl } from '~/server/utils/random-avatar'
import { readValidatedBodyCustom } from '~/server/utils/validation'

export const config = { runtime: 'edge' }

export default defineEventHandler(async event => {
  // 1) Validate input
  const { phone, code, name } = await readValidatedBodyCustom(
    event,
    z.object({
      phone: z.string().regex(/^\+98\d{10}$/),
      code:  z.string().length(6),
      name:  z.string().min(2).max(32).optional()
    })
  )

  // 2) Check OTP
  const stored = await redis.get(`otp:${phone}`)
  if (stored !== code) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid code' })
  }
  await redis.del(`otp:${phone}`)

  // 3) Load or create user
  const userKey = `user:${phone}`
  const userRaw = await redis.get(userKey)
  let user: { phone: string; name: string; avatarUrl: string; teamId: string }

  if (userRaw) {
    user = JSON.parse(userRaw)
  } else {
    const teamId = randomUUID()
    user = {
      phone,
      name:      name ?? 'User',
      avatarUrl: createAvatarUrl(),
      teamId
    }
    await redis.set(userKey, JSON.stringify(user))
    await redis.set(
      `team:${teamId}`,
      JSON.stringify({ id: teamId, owner: phone, members: [phone] })
    )
  }

  // 4) Sign JWT with both phone AND teamId
  const jwt = await signJwt({ phone: user.phone, teamId: user.teamId })
  setSecureCookie(event, 'auth_token', jwt)

  return { ok: true }
})
