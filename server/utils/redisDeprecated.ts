// // server/utils/redis.ts
// import Redis from 'ioredis'

// const config = useRuntimeConfig()

// // Create the client with retry & timeout options
// export const redis = new Redis(config.redisUrl, {
//   // fail to connect after 10s rather than hanging
//   connectTimeout: 10_000,

//   // retry with exponential backoff: 50ms, 100ms, 150ms, … up to 2s
//   retryStrategy(times) {
//     return Math.min(times * 50, 2000)
//   },

//   // optional: enable auto-resubscribe / auto-reconnect (default true)
//   enableOfflineQueue: true,
// })

// // Log connection lifecycle events
// redis.on('connect', () => {
//   console.log('[Redis] connected')
// })

// redis.on('ready', () => {
//   console.log('[Redis] ready to use')
// })

// redis.on('error', (err) => {
//   console.error('[Redis] error', err)
// })

// redis.on('close', () => {
//   console.log('[Redis] connection closed')
// })

// // Explicitly start the connection so that we can catch initial errors
// redis.connect().catch(err => {
//   console.error('[Redis] failed to connect on startup', err)
// })



// server/utils/redis.ts
export const redis = {
  on: () => {},
  get: async () => null,
  set: async () => {},
  del: async () => {},
}
