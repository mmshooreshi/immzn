import { randomInt } from 'crypto'
import { assertGuest } from '~/server/utils/auth-helpers'
import { assertRateLimit } from '~/server/utils/rate-limit'
import { getRequestIP } from 'h3'
import https from 'https'
const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  assertGuest(event)
  const ip = getRequestIP(event) ?? 'local'
  console.log('IP:', ip, event)

  if (!ip) throw createError({ statusCode: 400, statusMessage: 'IP not found' })

  const { phone } = await readBody<{ phone: string }>(event)

  // max 3 OTPs per phone every 10 minutes
  await assertRateLimit(event, {
    key   : `otp:${phone}`,
    // max   : 3,
    // window: 60 * 10
    max: 10000000000,
    window: 60 * 1000000000000000
    // i wanna have alll logins of a person thats the reason of this bullshit
  })

  // // max 10 OTP requests per IP per hour
  // await assertRateLimit(event, {
  //   key   : `ip:${ip}`,
  //   max   : 10,
  //   window: 60 * 60
  // })

  // Send request to Melipayamak API
  const data = JSON.stringify({ to: phone })

  const options = {
    hostname: 'console.melipayamak.com',
    port: 443,
    path: `/api/send/otp/${config.melipayamakApiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  }

  const otp = await new Promise<string>((resolve, reject) => {
    const req = https.request(options, res => {
      let body = ''
      res.on('data', chunk => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          if (parsed?.code) {
            resolve(parsed.code.toString())
          } else {
            reject(new Error(parsed?.status || 'OTP send failed'))
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })

  await useStorage('redis').setItem(`otp:${phone}`, otp, { ttl: 300 }) // 5 minutes
  $log.info('📨 OTP generated and sent', { phone, otp })

  return { ok: true }
})
