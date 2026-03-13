import { useDB } from '~/server/database'
import { posts } from '~/server/database/schema'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const id = parseInt(getRouterParam(event, 'id') as string)

  await db.update(posts)
    .set({ likes: sql`${posts.likes} + 1` })
    .where(eq(posts.id, id))

  return { ok: true }
})
