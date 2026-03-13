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
    // Create tables one by one
    const pool = getPool()
    for (const sql of createTableStatements) {
      await pool.query(sql)
    }
    console.log('[db-init] Tables ensured')

    const db = useDB()

    // Seed products if empty
    const [{ value: productCount }] = await db.select({ value: count() }).from(products)
    if (productCount === 0) {
      console.log('[db-init] Seeding products...')
      const allProducts = [...yarnProducts, ...hookProducts]
      const allLinks = { ...yarnLinks, ...hookLinks }

      for (const p of allProducts) {
        try {
          const [inserted] = await db.insert(products).values(p).returning({ id: products.id })
          const links = allLinks[p.name]
          if (links && inserted) {
            for (const link of links) {
              await db.insert(productLinks).values({
                productId: inserted.id,
                platform: link.platform,
                url: link.url,
                price: link.price,
              })
            }
          }
        } catch (err) {
          console.error(`[db-init] Failed to seed product "${p.name}":`, err)
        }
      }
      console.log(`[db-init] Seeded ${allProducts.length} products`)
    }

    // Seed resources if empty (independent of products)
    const [{ value: resourceCount }] = await db.select({ value: count() }).from(resources)
    if (resourceCount === 0) {
      console.log('[db-init] Seeding resources...')
      for (const r of seedResources) {
        try {
          await db.insert(resources).values(r)
        } catch (err) {
          console.error(`[db-init] Failed to seed resource "${r.title}":`, err)
        }
      }
      console.log(`[db-init] Seeded ${seedResources.length} resources`)
    }

    // Seed posts if empty (independent of products)
    const [{ value: postCount }] = await db.select({ value: count() }).from(posts)
    if (postCount === 0) {
      console.log('[db-init] Seeding posts...')
      const postIds: number[] = []
      for (const p of seedPosts) {
        try {
          const [inserted] = await db.insert(posts).values({
            title: p.title,
            content: p.content,
            category: p.category,
            authorName: p.authorName,
            likes: p.likes,
          }).returning({ id: posts.id })
          if (inserted) postIds.push(inserted.id)
        } catch (err) {
          console.error(`[db-init] Failed to seed post "${p.title}":`, err)
        }
      }

      for (const c of seedComments) {
        const postId = postIds[c.postIndex]
        if (postId) {
          try {
            await db.insert(comments).values({
              postId,
              content: c.content,
              authorName: c.author,
            })
          } catch (err) {
            console.error(`[db-init] Failed to seed comment:`, err)
          }
        }
      }
      console.log(`[db-init] Seeded ${seedPosts.length} posts, ${seedComments.length} comments`)
    }

    console.log(`[db-init] Done. Products: ${productCount}, Resources: ${resourceCount}, Posts: ${postCount}`)
  } catch (err) {
    console.error('[db-init] Failed:', err)
  }
})
