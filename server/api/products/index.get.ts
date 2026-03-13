import { useDB } from '~/server/database'
import { products } from '~/server/database/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const query = getQuery(event)
  const category = query.category as string | undefined
  const limit = query.limit ? parseInt(query.limit as string) : 100

  let result
  if (category) {
    result = await db.select().from(products)
      .where(eq(products.category, category))
      .orderBy(desc(products.createdAt))
      .limit(limit)
  } else {
    result = await db.select().from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
  }

  return result
})
