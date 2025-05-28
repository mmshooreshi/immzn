import { z } from 'zod'
export async function readValidatedBodyCustom<T> (event: any, schema: z.ZodSchema<T>): Promise<T> {
  const body = await readBody(event)
  return schema.parse(body)
}
    