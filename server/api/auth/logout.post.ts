export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token')
  $log.info('👋 Logged out')
  return { ok: true }
})