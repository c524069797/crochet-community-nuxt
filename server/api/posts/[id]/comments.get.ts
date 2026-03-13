import { useDB } from '~/server/database'
import { comments } from '~/server/database/schema'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const id = parseInt(getRouterParam(event, 'id') as string)

  const result = await db.select().from(comments)
    .where(eq(comments.postId, id))
    .orderBy(asc(comments.createdAt))

  return result
})
