import { useDB, getPool } from '../database'
import { products, productLinks, resources, posts, comments } from '../database/schema'
import { count } from 'drizzle-orm'
import {
  yarnProducts, hookProducts, hookLinks, yarnLinks,
  seedResources, seedPosts, seedComments,
} from '../database/seed'

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS products (
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
  )`,
  `CREATE TABLE IF NOT EXISTS product_links (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    price TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    file_url TEXT,
    video_url TEXT,
    platform TEXT,
    author TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_name TEXT NOT NULL,
    images TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
]

export default defineNitroPlugin(async () => {
  const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  if (!connStr) {
    console.warn('[db-init] No database URL found, skipping initialization')
    return
  }

  try {
    const pool = getPool()

    // Create tables one by one
    for (const sql of createTableStatements) {
      await pool.query(sql)
    }
    console.log('[db-init] Tables ensured')

    const db = useDB()

    // Seed products (batch insert)
    const [{ value: productCount }] = await db.select({ value: count() }).from(products)
    if (productCount === 0) {
      console.log('[db-init] Seeding products...')
      const allProducts = [...yarnProducts, ...hookProducts]
      const allLinks = { ...yarnLinks, ...hookLinks }

      // Batch insert all products at once
      const inserted = await db.insert(products).values(allProducts).returning({ id: products.id, name: products.name })

      // Batch insert all links
      const allLinkRows: { productId: number; platform: string; url: string; price: string }[] = []
      for (const row of inserted) {
        const links = allLinks[row.name]
        if (links) {
          for (const link of links) {
            allLinkRows.push({
              productId: row.id,
              platform: link.platform,
              url: link.url,
              price: link.price,
            })
          }
        }
      }
      if (allLinkRows.length > 0) {
        await db.insert(productLinks).values(allLinkRows)
      }
      console.log(`[db-init] Seeded ${inserted.length} products, ${allLinkRows.length} links`)
    }

    // Seed resources (batch insert)
    const [{ value: resourceCount }] = await db.select({ value: count() }).from(resources)
    if (resourceCount === 0) {
      console.log('[db-init] Seeding resources...')
      await db.insert(resources).values(seedResources)
      console.log(`[db-init] Seeded ${seedResources.length} resources`)
    }

    // Seed posts (batch insert)
    const [{ value: postCount }] = await db.select({ value: count() }).from(posts)
    if (postCount === 0) {
      console.log('[db-init] Seeding posts...')
      const insertedPosts = await db.insert(posts).values(
        seedPosts.map(p => ({
          title: p.title,
          content: p.content,
          category: p.category,
          authorName: p.authorName,
          likes: p.likes,
        }))
      ).returning({ id: posts.id })

      // Batch insert comments
      const commentRows = seedComments
        .filter(c => insertedPosts[c.postIndex])
        .map(c => ({
          postId: insertedPosts[c.postIndex].id,
          content: c.content,
          authorName: c.author,
        }))
      if (commentRows.length > 0) {
        await db.insert(comments).values(commentRows)
      }
      console.log(`[db-init] Seeded ${insertedPosts.length} posts, ${commentRows.length} comments`)
    }

    console.log('[db-init] Done')
  } catch (err) {
    console.error('[db-init] Failed:', err)
  }
})
