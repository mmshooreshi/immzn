export default eventHandler((event) => {
  if (!event.context.user) {
    $log.warn('🕵️‍♀️ /api/me without user')
    throw createError({ statusCode: 401 })
  }
  return event.context.user
})
