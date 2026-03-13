import { Pool } from 'pg'

export default defineEventHandler(async () => {
  const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  const checks: Record<string, unknown> = {}

  const pool = new Pool({
    connectionString: connStr,
    max: 1,
    connectionTimeoutMillis: 10000,
  })

  try {
    // Check current counts
    const counts = await pool.query(`
      SELECT
        (SELECT count(*) FROM products) as products,
        (SELECT count(*) FROM resources) as resources,
        (SELECT count(*) FROM posts) as posts
    `)
    checks.counts = counts.rows[0]

    // Try inserting a test product via raw SQL
    try {
      const insertResult = await pool.query(`
        INSERT INTO products (name, category, subcategory, description, image_url, price_range, rating, rating_count, rank, recommend_reason)
        VALUES ('测试产品', 'yarn', 'cotton', '测试描述', '/images/products/product-1.jpg', '¥10', 4.5, 100, 99, '测试推荐')
        RETURNING id
      `)
      checks.test_insert = 'OK'
      checks.test_id = insertResult.rows[0]?.id

      // Delete test row
      await pool.query(`DELETE FROM products WHERE id = $1`, [insertResult.rows[0]?.id])
      checks.test_delete = 'OK'
    } catch (err: unknown) {
      checks.test_insert = 'FAILED'
      checks.test_insert_error = err instanceof Error ? err.message : String(err)
    }

    // Try using Drizzle to insert
    try {
      const { useDB } = await import('~/server/database')
      const { products } = await import('~/server/database/schema')
      const db = useDB()
      const [inserted] = await db.insert(products).values({
        name: '测试Drizzle产品',
        category: 'yarn',
        subcategory: 'cotton',
        description: '测试',
        imageUrl: '/images/products/product-1.jpg',
        priceRange: '¥10',
        rating: 4.5,
        ratingCount: 100,
        rank: 99,
        recommendReason: '测试',
      }).returning({ id: products.id })
      checks.drizzle_insert = 'OK'
      checks.drizzle_id = inserted?.id

      // Delete test row
      if (inserted?.id) {
        await pool.query(`DELETE FROM products WHERE id = $1`, [inserted.id])
        checks.drizzle_delete = 'OK'
      }
    } catch (err: unknown) {
      checks.drizzle_insert = 'FAILED'
      checks.drizzle_error = err instanceof Error ? err.message : String(err)
      checks.drizzle_stack = err instanceof Error ? err.stack?.split('\n').slice(0, 8) : undefined
    }
  } catch (err: unknown) {
    checks.error = err instanceof Error ? err.message : String(err)
  }

  await pool.end()
  return checks
})
