// server/api/team/my.get.ts
import { prisma } from '~/server/utils/prisma'
export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: user.id },
    include: {
      team: true
    }
  })

  if (!teamMember) return null

  return {
    name: teamMember.team.name,
    track: teamMember.team.hackathonTrack,
    token: teamMember.team.id.toString() // or use invite token logic if stored separately
  }
})