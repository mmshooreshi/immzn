// server/api/team/invites.get.ts
import { prisma } from '~/server/utils/prisma'
export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // Assuming invites are stored in a Redis-like store or DB table.
  // Replace with DB/Redis call if necessary.

  // Example mock — replace with real query
  return [
    { phone: '+989123456789', sentAt: '2025-05-27T12:00:00Z' },
    { phone: '+989109876543', sentAt: '2025-05-27T13:15:00Z' }
  ]
})