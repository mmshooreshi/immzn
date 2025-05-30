// server/middleware/auth-context.ts
import { verifyJwt } from '~/server/utils/jwt'
import { prisma } from '~/server/utils/prisma'
import { getCookie, deleteCookie } from 'h3'
import { $log } from '~/server/utils/log'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    $log.warn('🍪 No auth_token cookie found')
    return
  }

  $log.debug('🔍 Verifying auth_token')

  try {
    const payload = await verifyJwt(token)
    const userId = Number(payload?.sub)

    if (!userId || isNaN(userId)) {
      $log.warn('❌ Invalid JWT "sub"', payload)
      deleteCookie(event, 'auth_token')
      return
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    // console.log("yoooooooooooo", user)

    if (user) {
      event.context.user = user
      $log.info('👤 User attached to context', user.id)
    } else {
      $log.warn('❌ No user found for sub:', userId)
    }
  } catch (err) {
    $log.error('❌ JWT verification failed', err)
    deleteCookie(event, 'auth_token')
  }
})
