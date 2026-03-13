import { getPool } from '~/server/database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const confirm = query.confirm as string

  if (confirm !== 'yes') {
    return { error: 'Pass ?confirm=yes to reset and reseed the database' }
  }

  const pool = getPool()

  const dropStatements = [
    'DROP TABLE IF EXISTS comments CASCADE',
    'DROP TABLE IF EXISTS product_links CASCADE',
    'DROP TABLE IF EXISTS posts CASCADE',
    'DROP TABLE IF EXISTS resources CASCADE',
    'DROP TABLE IF EXISTS products CASCADE',
  ]

  for (const sql of dropStatements) {
    await pool.query(sql)
  }

  return { success: true, message: 'All tables dropped. Next request will trigger auto-seed.' }
})
