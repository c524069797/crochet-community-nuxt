import { useDB } from '~/server/database'
import { products, resources, posts } from '~/server/database/schema'
import { count, eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()

  const [{ value: productCount }] = await db.select({ value: count() }).from(products)
  const [{ value: resourceCount }] = await db.select({ value: count() }).from(resources)
  const [{ value: postCount }] = await db.select({ value: count() }).from(posts)
  const [{ value: bilibiliCount }] = await db.select({ value: count() }).from(resources).where(eq(resources.platform, 'bilibili'))

  return {
    products: productCount,
    resources: resourceCount,
    posts: postCount,
    bilibiliResources: bilibiliCount,
  }
})
