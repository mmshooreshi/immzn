// server/utils/prisma.ts
import pkg from '@prisma/client'
import { createLogger } from '~/utils/createLogger'

const { PrismaClient } = pkg
const log = createLogger()

const g = globalThis as any
export const prisma: InstanceType<typeof PrismaClient> = g.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') g.prisma = prisma

log.info('🗄️  Prisma client ready')

