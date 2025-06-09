// server/utils/jwt.ts
import { jwtVerify, SignJWT } from 'jose'

const secret = () => new TextEncoder().encode(useRuntimeConfig().jwtSecret)

interface JWTPayload {
  [key: string]: any; // Adjust keys and types based on actual payload requirements
}

export async function signJwt(payload: JWTPayload) {
  $log.debug('🔑 Signing JWT', payload)
  $log.info('🔑 access-jwt (15 s) is geeting signed', payload)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')

    //debug short exp:
    // .setExpirationTime('15s')
    .sign(secret())
}

export async function verifyJwt(token: string) {
  $log.debug('🔍 Verifying JWT')
  const { payload } = await jwtVerify(token, secret())
  return payload
}

// helper – 30 day refresh-token
export async function signRefreshJwt(payload: JWTPayload) {
  $log.info('🎫 refresh-jwt (120 s) is getting signed', payload)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')

    //debug short exp:
    // .setExpirationTime('120s')
    .sign(secret())
}
