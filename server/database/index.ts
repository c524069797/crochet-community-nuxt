import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null
let _pool: Pool | null = null

function getConnectionString() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
}

export function useDB() {
  if (_db) return _db

  _pool = new Pool({
    connectionString: getConnectionString(),
    max: 5,
    connectionTimeoutMillis: 10000,
  })
  _db = drizzle(_pool, { schema })
  return _db
}

export function getPool() {
  if (!_pool) {
    _pool = new Pool({
      connectionString: getConnectionString(),
      max: 5,
      connectionTimeoutMillis: 10000,
    })
  }
  return _pool
}
