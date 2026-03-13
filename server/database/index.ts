import { createClient } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null
let _client: ReturnType<typeof createClient> | null = null

export function useDB() {
  if (_db) return _db

  _client = createClient()
  _db = drizzle(_client, { schema })
  return _db
}

export function getClient() {
  if (!_client) {
    _client = createClient()
  }
  return _client
}
