import { getCookie, setCookie, deleteCookie, createError } from 'h3'
import { verifyJwt, signJwt } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'refresh_token')
    $log.info('🔄 /auth/refresh called and token is: ', token)
    if (!token) throw createError({ statusCode: 401, statusMessage: 'No refresh token' })

    try {
        $log.info('🔄 /auth/refresh called')
        const payload = await verifyJwt(token)
        $log.info('payload is: ', payload)
        if (payload.type !== 'refresh') throw new Error('wrong type')

        const access = await signJwt({ sub: payload.sub })
        setCookie(event, 'auth_token', access, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60                // 1 h
            // maxAge: 15                // 15s  debug short exp
        })
        $log.info('✅ refresh success – new 15 s access token issued')
        return { ok: true }
    } catch {
        deleteCookie(event, 'refresh_token')
        throw createError({ statusCode: 401, statusMessage: 'Refresh token invalid' })
    }
})
