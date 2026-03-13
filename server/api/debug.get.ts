import { createClient } from '@vercel/postgres'

export default defineEventHandler(async () => {
  const checks: Record<string, unknown> = {
    env_POSTGRES_URL: !!process.env.POSTGRES_URL,
    env_DATABASE_URL: !!process.env.DATABASE_URL,
  }

  try {
    const client = createClient()
    const result = await client.query('SELECT 1 as test')
    checks.db_connection = 'OK'
    checks.db_result = result.rows
  } catch (err: unknown) {
    checks.db_connection = 'FAILED'
    checks.db_error = err instanceof Error ? err.message : String(err)
    checks.db_stack = err instanceof Error ? err.stack?.split('\n').slice(0, 5) : undefined
  }

  return checks
})
