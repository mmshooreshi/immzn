// /server/api/auth/send-otp.post.ts
import { redis } from '~/server/utils/redisDeprecated'
// import { rateLimit } from '~/server/utils/rate-limit'
import { z } from 'zod'
import { randomInt } from 'crypto'
import { readValidatedBodyCustom } from '~/server/utils/validation'
import { scoped } from '~/server/utils/log'
import { sendSms } from '~/server/utils/sms'

const logger = scoped('otp')

export const config = { runtime: 'edge' }

export default defineEventHandler(async event => {
  // await rateLimit(event, { max: 5, window: 60 })

  const { phone } = await readValidatedBodyCustom(event,
    z.object({ 
      phone: z.string().regex(/^\+98\d{10}$/) })
  )

  const otp = randomInt(100000, 999999).toString()
  logger.info(`OTP ${otp} → ${phone}`)

  await redis.set(`otp:${phone}`, otp, { EX: 300 })

  const cfg = useRuntimeConfig(event)
  await sendSms(phone, Number(cfg.smsIrTemplateId), [
    { Name: 'verificationcode', Value: otp }
  ])

  logger.success('OTP process complete')
  return { ok: true }
})
