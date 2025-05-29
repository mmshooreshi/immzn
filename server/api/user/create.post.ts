// server/api/payment/create.post.ts
import { prisma } from '~/server/utils/prisma'
import { readValidatedBodyCustom } from '~/server/utils/validation'
import { z } from 'zod'

export default defineEventHandler(async event => {
  const user = event.context.user!
  const { amount } = await readValidatedBodyCustom(event, z.object({ amount: z.number() }))
  const payment = await prisma.payment.create({
    data: { userId: user.id, amount, method: 'IRR', status: 'PENDING' }
  })
  // integrate your IRR checkout here
  const checkoutUrl = `https://pay.ir/checkout/${payment.id}`
  return { checkoutUrl }
})