// server/api/auth/verify-otp.post.ts
import { prisma }    from '~/server/utils/prisma'
import { assertGuest } from '~/server/utils/auth-helpers'
import { assertRateLimit } from '~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
    assertGuest(event)
  
  try {
    const { phone, otp } = await readBody<{ phone: string; otp: string }>(event)

      // max 5 OTP‐verify attempts per phone every 10 minutes
    await assertRateLimit(event, {
      key   : `otp-verify:${phone}`,
      max   : 5,
      window: 60 * 10
    })

    const realOtp        = await useStorage('redis').getItem<string>(`otp:${phone}`)
    $log.info('🔍 Redis returned OTP', { realOtp:realOtp?.toString(), provided: otp.toString() })

    if (realOtp?.toString() !== otp.toString()) {
      $log.warn('⚠️ Wrong OTP', { phone })
      throw createError({ statusCode: 401, statusMessage: 'Wrong OTP' })
    } else{
       $log.warn('✅ Correct OTP', { phone })

    }

    await useStorage('redis').removeItem(`otp:${phone}`)

    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      user = await prisma.user.create({ data: { phone } })
      $log.info('🆕 User created', user.id)
    } else {
      $log.info('🆕 User existed', user.id)

    }

    const token = await signJwt({ sub: user.id, phone })

    setCookie(event, 'auth_token', token, {
      
      path: '/', // ✅ makes it accessible to all routes
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
    $log.debug('🔐 JWT set on cookie', token)
    $log.debug('📜 JWT payload', await verifyJwt(token))

    

    $log.info('✅ Authenticated', user.id)
    return {
      ok: true,
      userId: user.id,
      phone
    }

  } catch (err) {
    $log.error('❌ verify-otp failed', err)
    throw err
  }


})