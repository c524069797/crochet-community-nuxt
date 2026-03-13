import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

export function useDB() {
  if (_db) return _db

  const config = useRuntimeConfig()
  const sql = neon(config.postgresUrl)
  _db = drizzle(sql, { schema })
  return _db
}
