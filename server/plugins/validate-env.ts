// server/plugins/a-validate-env.ts

import { z } from 'zod'

export default defineNitroPlugin(() => {
  const cfg = useRuntimeConfig()

  // console.log('🔍 Runtime config:', cfg)

  const envSchema = z.object({
    jwtSecret  : z.string().min(32, 'JWT_SECRET must be 32+ chars'),
    databaseUrl: z.string().url('Invalid DATABASE_URL'),
    redisUrl   : z.string().url('Invalid REDIS_URL'),
  })

  const result = envSchema.safeParse(cfg)

  if (!result.success) {
    console.error('❌ Invalid env vars', result.error.format())
    // console.error('❌ Invalid env vars', result.error.format(), cfg)
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid environment variables',
    })
  }

  console.info('✅ Environment variables validated')
})
