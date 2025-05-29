// server/api/team/create.post.ts
import { prisma } from '~/server/utils/prisma'
import { z } from 'zod'
import { readValidatedBodyCustom } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const data = await readValidatedBodyCustom(event, z.object({
    name: z.string().min(2),
    hackathonTrack: z.string().min(2)
  }))

  const existingMember = await prisma.teamMember.findFirst({
    where: { userId: user.id }
  })

  if (existingMember) {
    throw createError({ statusCode: 400, statusMessage: 'Already in a team' })
  }

  const team = await prisma.team.create({
    data: {
      name: data.name,
      hackathonTrack: data.hackathonTrack,
      leaderId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'Leader'
        }
      }
    }
  })

  return {
    name: team.name,
    track: team.hackathonTrack,
    token: team.id.toString() // or generate a token for invite URL
  }
})