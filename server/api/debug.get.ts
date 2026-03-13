import { Pool } from 'pg'

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, subcategory TEXT, description TEXT, image_url TEXT, price_range TEXT, rating REAL DEFAULT 0, rating_count INTEGER DEFAULT 0, rank INTEGER DEFAULT 0, recommend_reason TEXT, created_at TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS product_links (id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, platform TEXT NOT NULL, url TEXT NOT NULL, price TEXT)`,
  `CREATE TABLE IF NOT EXISTS resources (id SERIAL PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL, category TEXT NOT NULL, description TEXT, image_url TEXT, file_url TEXT, video_url TEXT, platform TEXT, author TEXT, created_at TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, category TEXT NOT NULL, author_name TEXT NOT NULL, images TEXT, likes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, content TEXT NOT NULL, author_name TEXT NOT NULL, likes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`,
]

export default defineEventHandler(async () => {
  const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  const checks: Record<string, unknown> = {}
  const pool = new Pool({ connectionString: connStr, max: 2, connectionTimeoutMillis: 10000 })

  try {
    // Create tables
    for (const sql of createTableStatements) {
      await pool.query(sql)
    }
    checks.tables = 'created'

    // Check counts
    const countResult = await pool.query(`SELECT (SELECT count(*) FROM products) as p, (SELECT count(*) FROM resources) as r, (SELECT count(*) FROM posts) as po`)
    checks.counts_before = countResult.rows[0]

    // Seed if empty using Drizzle batch inserts
    const { useDB } = await import('~/server/database')
    const schema = await import('~/server/database/schema')
    const { count } = await import('drizzle-orm')
    const seed = await import('../database/seed')
    const db = useDB()

    const [{ value: pc }] = await db.select({ value: count() }).from(schema.products)
    if (pc === 0) {
      const allProducts = [...seed.yarnProducts, ...seed.hookProducts]
      const allLinks = { ...seed.yarnLinks, ...seed.hookLinks }
      const inserted = await db.insert(schema.products).values(allProducts).returning({ id: schema.products.id, name: schema.products.name })
      const linkRows: { productId: number; platform: string; url: string; price: string }[] = []
      for (const row of inserted) {
        const links = allLinks[row.name]
        if (links) {
          for (const l of links) linkRows.push({ productId: row.id, platform: l.platform, url: l.url, price: l.price })
        }
      }
      if (linkRows.length > 0) await db.insert(schema.productLinks).values(linkRows)
      checks.products_seeded = inserted.length
      checks.links_seeded = linkRows.length
    }

    const [{ value: rc }] = await db.select({ value: count() }).from(schema.resources)
    if (rc === 0) {
      await db.insert(schema.resources).values(seed.seedResources)
      checks.resources_seeded = seed.seedResources.length
    }

    const [{ value: poc }] = await db.select({ value: count() }).from(schema.posts)
    if (poc === 0) {
      const insertedPosts = await db.insert(schema.posts).values(
        seed.seedPosts.map(p => ({ title: p.title, content: p.content, category: p.category, authorName: p.authorName, likes: p.likes }))
      ).returning({ id: schema.posts.id })
      const commentRows = seed.seedComments
        .filter(c => insertedPosts[c.postIndex])
        .map(c => ({ postId: insertedPosts[c.postIndex].id, content: c.content, authorName: c.author }))
      if (commentRows.length > 0) await db.insert(schema.comments).values(commentRows)
      checks.posts_seeded = insertedPosts.length
      checks.comments_seeded = commentRows.length
    }

    // Final counts
    const finalResult = await pool.query(`SELECT (SELECT count(*) FROM products) as p, (SELECT count(*) FROM resources) as r, (SELECT count(*) FROM posts) as po`)
    checks.counts_after = finalResult.rows[0]
    checks.success = true
  } catch (err: unknown) {
    checks.error = err instanceof Error ? err.message : String(err)
    checks.stack = err instanceof Error ? err.stack?.split('\n').slice(0, 8) : undefined
  }

  await pool.end()
  return checks
})
