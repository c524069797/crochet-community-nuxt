import { Pool } from 'pg'

export default defineEventHandler(async () => {
  const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  const checks: Record<string, unknown> = {}

  try {
    const pool = new Pool({
      connectionString: connStr,
      max: 1,
      connectionTimeoutMillis: 10000,
    })

    // Test connection
    const testResult = await pool.query('SELECT 1 as test')
    checks.db_connection = 'OK'

    // Check which tables exist
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    checks.tables = tablesResult.rows.map((r: Record<string, string>) => r.table_name)

    // Try creating one table
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        description TEXT,
        image_url TEXT,
        price_range TEXT,
        rating REAL DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        rank INTEGER DEFAULT 0,
        recommend_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`)
      checks.create_table = 'OK'
    } catch (err: unknown) {
      checks.create_table = 'FAILED'
      checks.create_table_error = err instanceof Error ? err.message : String(err)
    }

    // Re-check tables
    const tablesResult2 = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    checks.tables_after = tablesResult2.rows.map((r: Record<string, string>) => r.table_name)

    await pool.end()
  } catch (err: unknown) {
    checks.error = err instanceof Error ? err.message : String(err)
    checks.stack = err instanceof Error ? err.stack?.split('\n').slice(0, 5) : undefined
  }

  return checks
})
