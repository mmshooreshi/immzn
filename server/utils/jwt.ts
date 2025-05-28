import { jwtVerify, SignJWT } from 'jose'

const secret = () => new TextEncoder().encode(useRuntimeConfig().jwtSecret)

interface JWTPayload {
  [key: string]: any; // Adjust keys and types based on actual payload requirements
}

export async function signJwt(payload: JWTPayload) {
  $log.debug('🔑 Signing JWT', payload)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret())
}

export async function verifyJwt (token: string) {
  $log.debug('🔍 Verifying JWT')
  const { payload } = await jwtVerify(token, secret())
  return payload
}