// server/utils/auth-helpers.ts
import {H3Event} from 'h3'
export function assertGuest (event: H3Event) {
  if (event.context.user)
    throw createError({ statusCode: 409, statusMessage: 'Already authenticated' })
}
