// server/utils/rate-limit.ts
import { H3Event, createError, setHeader } from 'h3'


interface Bucket {
  count: number
  reset: number  // unix ms when this window expires
}

interface RateLimitOptions {
  /** key under which we store our counter+reset */
  key: string
  /** how many calls allowed in each window */
  max: number
  /** window length in seconds */
  window: number
}

export async function assertRateLimit(
  event: H3Event,
  { key, max, window }: RateLimitOptions
) {
  const storage = useStorage('redis')  // let it infer from runtime type
  const now = Date.now()

  // 1. fetch existing bucket
  const bucket = (await storage.getItem<Bucket>(key)) ?? null

  let next: Bucket
  if (!bucket || bucket.reset <= now) {
    // window expired (or first hit) → reset
    next = { count: 1, reset: now + window * 1000 }
  } else {
    // inside the window → bump
    next = { count: bucket.count + 1, reset: bucket.reset }
  }

  // 2. persist it back
  //    no TTL needed: we store our own reset timestamp
  await storage.setItem(key, next)
  

  // 3. if over limit, throw 429 + Retry-After
  if (next.count > max) {
    const retryAfter = Math.ceil((next.reset - now) / 1000)
    setHeader(event, 'Retry-After', retryAfter)
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }
}
