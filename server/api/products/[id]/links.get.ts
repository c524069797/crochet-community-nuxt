import { useDB } from '~/server/database'
import { productLinks } from '~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const id = parseInt(getRouterParam(event, 'id') as string)

  const links = await db.select().from(productLinks)
    .where(eq(productLinks.productId, id))

  return links
})
