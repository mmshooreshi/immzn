export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token')
  deleteCookie(event, 'refresh_token')
  $log.info('👋 Logged out (removed both cookies)')
  return { ok: true }
})