import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

export function useDB() {
  if (_db) return _db

  _db = drizzle(sql, { schema })
  return _db
}
