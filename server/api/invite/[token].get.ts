// /server/api/invite/[token].get.ts
import { redis }           from '~/server/utils/redisDeprecated'
import { signJwt }         from '~/server/utils/jwt'
import { setSecureCookie } from '~/server/utils/secure-cookie'
import { createAvatarUrl } from '~/server/utils/random-avatar'
import { scoped }          from '~/server/utils/log'

const logger = scoped('invite-accept')
export const config = { runtime: 'edge' }

export default defineEventHandler(async event => {
  const token = event.context.params?.token as string
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  // 1) Lookup & consume invite
  const raw = await redis.get(`invite:${token}`)
  if (!raw) throw createError({ statusCode: 404, statusMessage: 'Invalid or expired invite' })
  await redis.del(`invite:${token}`)

  const payload = JSON.parse(raw) as {
    inviterPhone: string
    invitedPhone: string
    teamId?:      string
  }
  let { inviterPhone, invitedPhone, teamId } = payload
  logger.info(`invite token from ${inviterPhone} for ${invitedPhone}, teamId in payload: ${teamId}`)

  // 2) Fallback: if payload.teamId missing, fetch it from inviter’s profile
  if (!teamId) {
    const inviterRaw = await redis.get(`user:${inviterPhone}`)
    if (!inviterRaw) {
      throw createError({ statusCode: 500, statusMessage: 'Inviter profile not found to resolve teamId' })
    }
    const inviterProfile = JSON.parse(inviterRaw) as { teamId: string }
    teamId = inviterProfile.teamId
    logger.info(`fallback: resolved teamId=${teamId} from inviter profile`)
  }

  // 3) Create/update invitee’s user record
  const userKey = `user:${invitedPhone}`
  const existing = await redis.get(userKey)
  const profile = existing
    ? JSON.parse(existing)
    : {
        phone:     invitedPhone,
        name:      'User',
        avatarUrl: createAvatarUrl(),
        teamId
      }
  // ensure their teamId is correct
  profile.teamId = teamId
  await redis.set(userKey, JSON.stringify(profile))

  // 4) Add invitee to the team
  const teamRaw = await redis.get(`team:${teamId}`)
  if (!teamRaw) throw createError({ statusCode: 404, statusMessage: 'Team not found' })
  const team = JSON.parse(teamRaw) as { members: string[] }
  if (!team.members.includes(invitedPhone)) {
    team.members.push(invitedPhone)
    await redis.set(`team:${teamId}`, JSON.stringify(team))
  }

  // 5) Issue JWT & set cookie
  const jwt = await signJwt({ phone: invitedPhone, teamId })
  setSecureCookie(event, 'auth_token', jwt)
  logger.success(`user ${invitedPhone} signed up & joined team ${teamId}`)

  // 6) Return JSON
  return { ok: true, teamId }
})
