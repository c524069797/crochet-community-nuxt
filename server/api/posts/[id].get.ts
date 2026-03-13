import { useDB } from '~/server/database'
import { posts } from '~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const id = parseInt(getRouterParam(event, 'id') as string)

  const [post] = await db.select().from(posts).where(eq(posts.id, id))

  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return post
})
