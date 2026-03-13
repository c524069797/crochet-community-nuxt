import { useDB } from '~/server/database'
import { resources } from '~/server/database/schema'
import { eq, and, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const query = getQuery(event)
  const type = query.type as string | undefined
  const category = query.category as string | undefined
  const limit = query.limit ? parseInt(query.limit as string) : 100

  const conditions = []
  if (type) conditions.push(eq(resources.type, type))
  if (category) conditions.push(eq(resources.category, category))

  let result
  if (conditions.length > 0) {
    result = await db.select().from(resources)
      .where(and(...conditions))
      .orderBy(desc(resources.createdAt))
      .limit(limit)
  } else {
    result = await db.select().from(resources)
      .orderBy(desc(resources.createdAt))
      .limit(limit)
  }

  return result
})
