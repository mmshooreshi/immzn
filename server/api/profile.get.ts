import { getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'
import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })

  let payload: { id: number }
  try {
    payload = jwt.verify(token, useRuntimeConfig().jwtSecret) as any
  } catch {
    throw createError({ statusCode: 401 })
  }

  const res = await db.query('SELECT id, phone, created_at FROM users WHERE id=$1', [payload.id])
  if (!res.rowCount) throw createError({ statusCode: 404 })

  return { user: res.rows[0] }
})
