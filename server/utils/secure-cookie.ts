// export function setSecureCookie (
//   event: any,
//   name: string,
//   value: string,
//   maxAge = 60 * 60 * 24 * 7
// ) {
//   setCookie(event, name, value, {
//     httpOnly: true,
//     secure: true,
//     sameSite: 'strict',
//     path: '/',
//     maxAge
//   })
// }

// server/utils/secure-cookie.ts
import { sendError , H3Event} from 'h3'

export function setSecureCookie(
  event: H3Event,
  name: string,
  value: string
) {
  const isProd = process.env.NODE_ENV === 'production'
  event.node.res.setHeader('Set-Cookie', [
    // path=/ so it applies to /api and your pages
    // max-age, httpOnly, sameSite
    `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}` +
    (isProd ? '; Secure' : '')
  ])
}
