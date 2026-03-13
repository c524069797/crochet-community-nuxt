import { getPool } from '~/server/database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const confirm = query.confirm as string

  if (confirm !== 'yes') {
    return { error: 'Pass ?confirm=yes to reset and reseed the database' }
  }

  const pool = getPool()

  // Drop all tables and recreate
  await pool.query(`
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS product_links CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS resources CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
  `)

  return { success: true, message: 'All tables dropped. Restart the app to trigger auto-seed.' }
})
