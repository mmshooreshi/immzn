import { Pool } from 'pg'
const config = useRuntimeConfig()
export const db = new Pool({ connectionString: config.databaseUrl })
