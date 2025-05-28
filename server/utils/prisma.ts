import { PrismaClient } from '@prisma/client'
import { createLogger } from '~/utils/createLogger' // Safe fallback

const log = createLogger() // local instance just for this file

const g = globalThis as any
export const prisma: PrismaClient = g.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') g.prisma = prisma

log.info('🗄️  Prisma client ready') // use `log`, not `$log`
