// /server/api/team/invite.post.ts
// import { redis } from '~/server/utils/redisDeprecated'
import { readValidatedBodyCustom } from '~/server/utils/validation'
import { assertRateLimit } from '~/server/utils/rate-limit'
import { scoped } from '~/server/utils/log'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { sendSms } from '~/server/utils/sms'

const logger = scoped('invite')
export const config = { runtime: 'edge' }

export default defineEventHandler(async event => {

  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    // server/api/team/invite.post.ts
  await assertRateLimit(event, {
    key   : `team:${user.teamId}:invite:${event.context.user.id}`,
    max   : 20,          // 20 invites
    window: 24 * 60 * 60 // per day
  })

  // server/api/team/create.post.ts
  await assertRateLimit(event, {
    key   : `user:${event.context.user.id}:create-team`,
    max   : 3,               // 3 new teams
    window: 24 * 60 * 60     // per day
  })


  // await rateLimit(event, { max: 3, window: 60 })

  const { phone: invitedPhone } = await readValidatedBodyCustom(
    event,
    z.object({ phone: z.string().regex(/^\+98\d{10}$/) })
  )

  const token = nanoid(12)

  // store inviter, teamId, AND invitedPhone as JSON
  const payload = JSON.stringify({
    inviterPhone: user.phone,
    teamId:      user.teamId,
    invitedPhone
  })
  // await redis.set(`invite:${token}`, payload, { EX: 60 * 60 * 24 * 7 })

  logger.info(`created invite ${token} for ${invitedPhone}`)

  const cfg  = useRuntimeConfig(event)
  const link = `${event.node.req.headers['x-forwarded-proto'] ?? 'https'}://` +
               `${event.node.req.headers.host}/invite/${token}`

  await sendSms(invitedPhone, Number(cfg.smsIrTemplateId), [
    { Name: 'link', Value: link }
  ])

  logger.success(`invitation sent → ${invitedPhone}`)
  return { ok: true }
})
