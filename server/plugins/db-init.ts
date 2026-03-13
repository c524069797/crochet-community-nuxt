import { useDB } from '../database'
import { products, productLinks, resources, posts, comments } from '../database/schema'
import { count } from 'drizzle-orm'
import {
  yarnProducts, hookProducts, hookLinks, yarnLinks,
  seedResources, seedPosts, seedComments,
} from '../database/seed'

export default defineNitroPlugin(async () => {
  try {
    const db = useDB()

    // Check if products table has data
    const [{ value: productCount }] = await db.select({ value: count() }).from(products)

    if (productCount === 0) {
      console.log('[auto-init] Products table empty, seeding...')

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

      // Seed resources
      for (const r of seedResources) {
        await db.insert(resources).values(r)
      }

      // Seed posts
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

      // Seed comments
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

      console.log(`[auto-init] Seeded ${allProducts.length} products, ${seedResources.length} resources, ${seedPosts.length} posts`)
    }
  } catch (err) {
    console.error('[auto-init] Failed:', err)
  }
})
