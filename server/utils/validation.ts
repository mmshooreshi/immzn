import { z } from 'zod'
export async function readValidatedBodyCustom<T> (event: any, schema: z.ZodSchema<T>): Promise<T> {
  const body = await readBody(event)
  console.log(body)
  return schema.parse(body)
}
    