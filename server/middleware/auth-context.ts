// server/middleware/auth-context.ts
import { verifyJwt } from '~/server/utils/jwt'
import { prisma } from '~/server/utils/prisma'
import { getCookie, deleteCookie } from 'h3'
import { $log } from '~/server/utils/log'

export default defineEventHandler(async (event) => {
  const path = event.path

  // 💡 Skip auth for clearly public or static requests
  if (
    path.startsWith('/_nuxt/') ||
    path.startsWith('/favicon') ||
    path.startsWith('/.well-known/') ||
    path.endsWith('.svg') ||
    path.endsWith('.png') ||
    path.endsWith('.ico') ||
    path.includes('/auth/') ||         // auth routes handle their own logic
    path.includes('/api/public/') ||   // your custom unauth routes
    path.includes('/api/data/') ||   // your custom unauth routes
    path.includes('/api/_nuxt_icon/') ||   // your custom unauth routes
    event.method === 'OPTIONS'         // CORS preflight
  ) {
    // $log.info('event method is: ', event.method, ' and skipped auth context because path was: ', path)
    return
  }


  const token = getCookie(event, 'auth_token')
  if (!token) {
    $log.warn('🍪 No auth_token cookie found', path)
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
      $log.info('👤 User attached to context', user.id, '  path is: ', path)
    } else {
      $log.warn('❌ No user found for sub:', userId)
    }
  } catch (err) {
    $log.error('❌ JWT verification failed', err)

    /* 🔄 try to silently refresh once when access-token is expired */
    const refresh = getCookie(event, 'refresh_token')
    if (refresh) {
      try {
        const payload = await verifyJwt(refresh)
        if (payload?.sub) {
          const newAccess = await signJwt({ sub: payload.sub })
          setCookie(event, 'auth_token', newAccess, {
            path: '/', httpOnly: true, sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60
          })
          const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } })
          if (user) { event.context.user = user; return }
        }
        $log.info('🔄 middleware auto-refreshed access token', payload.sub)
      } catch {
        deleteCookie(event, 'auth_token')
        /* ignore – fall through to normal 401 handling */
      }
    }

    // deleteCookie(event, 'auth_token')
  }
})


