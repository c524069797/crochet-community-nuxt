import { useDB, getPool } from '../database'
import { products, productLinks, resources, posts, comments } from '../database/schema'
import { count } from 'drizzle-orm'
import {
  yarnProducts, hookProducts, hookLinks, yarnLinks,
  seedResources, seedPosts, seedComments,
} from '../database/seed'

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS products (
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
);

CREATE TABLE IF NOT EXISTS product_links (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  price TEXT
);

CREATE TABLE IF NOT EXISTS resources (
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
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  images TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
`

export default defineNitroPlugin(async () => {
  const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  if (!connStr) {
    console.warn('[db-init] No database URL found, skipping initialization')
    return
  }

  try {
    // Create tables using raw SQL via pg Pool
    const pool = getPool()
    await pool.query(createTablesSQL)
    console.log('[db-init] Tables ensured')

    // Seed data if empty
    const db = useDB()
    const [{ value: productCount }] = await db.select({ value: count() }).from(products)

    if (productCount === 0) {
      console.log('[db-init] Products table empty, seeding...')

      const allProducts = [...yarnProducts, ...hookProducts]
      const allLinks = { ...yarnLinks, ...hookLinks }

      for (const p of allProducts) {
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
      }

      for (const r of seedResources) {
        await db.insert(resources).values(r)
      }

      const postIds: number[] = []
      for (const p of seedPosts) {
        const [inserted] = await db.insert(posts).values({
          title: p.title,
          content: p.content,
          category: p.category,
          authorName: p.authorName,
          likes: p.likes,
        }).returning({ id: posts.id })
        if (inserted) postIds.push(inserted.id)
      }

      for (const c of seedComments) {
        const postId = postIds[c.postIndex]
        if (postId) {
          await db.insert(comments).values({
            postId,
            content: c.content,
            authorName: c.author,
          })
        }
      }

      console.log(`[db-init] Seeded ${allProducts.length} products, ${seedResources.length} resources, ${seedPosts.length} posts`)
    } else {
      console.log(`[db-init] Database already has ${productCount} products, skipping seed`)
    }
  } catch (err) {
    console.error('[db-init] Failed:', err)
  }
})
