import { useDB } from '~/server/database'
import { posts } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const body = await readBody(event)

  const { title, content, category, author_name } = body

  if (!title || !content || !category || !author_name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // For now, handle images as JSON from the body
  // Vercel Blob upload can be added later
  let imagesJson: string | null = null
  if (body.images && Array.isArray(body.images)) {
    imagesJson = JSON.stringify(body.images)
  }

  const [inserted] = await db.insert(posts).values({
    title,
    content,
    category,
    authorName: author_name,
    images: imagesJson,
  }).returning({ id: posts.id })

  setResponseStatus(event, 201)
  return { id: inserted.id, images: body.images || [] }
})
