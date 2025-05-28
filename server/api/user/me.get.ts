// /server/api/user/me.get.ts
import { scoped } from '~/server/utils/log'
import { redis }  from '~/server/utils/redisDeprecated'
import type { UserProfile } from '~/types'

const logger = scoped('me-get')
export const config = { runtime: 'edge' }

export default defineEventHandler(async event => {
  const user = event.context.user
  logger.success(
    `api get me called for user: ${user?.phone ?? 'anonymous'}`,
    user
  )
  if (!user) {
    throw createError({ statusCode: 401 })
  }

  // Fetch user profile
  const profileRaw = await redis.get(`user:${user.phone}`)
  if (!profileRaw) throw createError({ statusCode: 404 })

  const profile = JSON.parse(profileRaw) as UserProfile

  // Fetch team
  const teamRaw = await redis.get(`team:${profile.teamId}`)
  if (!teamRaw) throw createError({ statusCode: 404 })

  const team = JSON.parse(teamRaw) as { members: string[] }

  // Fetch teammates
  const teammatesRaw = await Promise.all(
    team.members.map((p: string) => redis.get(`user:${p}`))
  )

  profile.teammates = teammatesRaw
    .filter(Boolean)
    .map(str => JSON.parse(str as string) as UserProfile)

  return profile
})
