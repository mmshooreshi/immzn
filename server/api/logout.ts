import { defineEventHandler, setCookie } from 'h3'

export default defineEventHandler((event) => {
  // Clear the session cookie
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  })
  return { status: 'ok' }
})
