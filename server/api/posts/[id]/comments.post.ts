import { useDB } from '~/server/database'
import { comments } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const id = parseInt(getRouterParam(event, 'id') as string)
  const body = await readBody(event)

  const { content, author_name } = body

  if (!content || !author_name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const [inserted] = await db.insert(comments).values({
    postId: id,
    content,
    authorName: author_name,
  }).returning({ id: comments.id })

  setResponseStatus(event, 201)
  return { id: inserted.id }
})
