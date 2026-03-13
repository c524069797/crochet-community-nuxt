import { useDB } from '~/server/database'
import { resources } from '~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const id = parseInt(getRouterParam(event, 'id') as string)

  const [resource] = await db.select().from(resources).where(eq(resources.id, id))

  if (!resource) {
    throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
  }

  return resource
})
