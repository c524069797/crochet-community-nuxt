import { useDB } from '~/server/database'
import { posts, comments } from '~/server/database/schema'
import { eq, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const query = getQuery(event)
  const category = query.category as string | undefined
  const limit = query.limit ? parseInt(query.limit as string) : 100

  // Use raw SQL for comment_count subquery like the original
  const baseQuery = db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    category: posts.category,
    authorName: posts.authorName,
    images: posts.images,
    likes: posts.likes,
    createdAt: posts.createdAt,
    commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.as('comment_count'),
  }).from(posts)

  let result
  if (category) {
    result = await baseQuery
      .where(eq(posts.category, category))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
  } else {
    result = await baseQuery
      .orderBy(desc(posts.createdAt))
      .limit(limit)
  }

  return result
})
