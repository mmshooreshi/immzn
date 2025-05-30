// server/api/user/update.post.ts
import { prisma } from '~/server/utils/prisma'
import { z } from 'zod'
import { readValidatedBodyCustom } from '~/server/utils/validation'
import { Role, Attendance } from '@prisma/client' // ✅ this matters!

export default defineEventHandler(async event => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const schema = z.object({
    fullName: z.string().min(1).optional(),
    affiliation: z.string().min(1).optional(),
    role: z.nativeEnum(Role).optional(),
    field: z.string().min(1).optional(),
    attendance: z.nativeEnum(Attendance).optional(),
    tracks: z.array(z.string()).optional(),
    wantsNewsletter: z.boolean().optional()
  })

  const body = await readValidatedBodyCustom(event, schema)

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: body
  })

  return updatedUser
})
