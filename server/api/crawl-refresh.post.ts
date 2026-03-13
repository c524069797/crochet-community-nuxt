import { useDB } from '~/server/database'
import { resources } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { searchQueries, fetchBilibiliVideos, sleep } from '~/server/utils/crawler'

let crawlInProgress = false

export default defineEventHandler(async () => {
  if (crawlInProgress) {
    throw createError({ statusCode: 429, statusMessage: '爬取正在进行中，请稍后再试' })
  }

  crawlInProgress = true
  try {
    const db = useDB()

    // Get existing bilibili video URLs
    const existingRows = await db.select({ videoUrl: resources.videoUrl })
      .from(resources)
      .where(eq(resources.platform, 'bilibili'))

    const existing = new Set(existingRows.map(r => r.videoUrl))
    let totalNew = 0

    for (const { keyword, category } of searchQueries) {
      console.log(`Searching: "${keyword}" (category: ${category})`)
      const videos = await fetchBilibiliVideos(keyword)
      let newCount = 0

      for (const v of videos) {
        if (existing.has(v.videoUrl)) continue
        existing.add(v.videoUrl)

        await db.insert(resources).values({
          title: v.title,
          type: 'video',
          category,
          description: v.description || `${v.author} 的钩织教程视频`,
          imageUrl: v.imageUrl,
          videoUrl: v.videoUrl,
          platform: 'bilibili',
          author: v.author,
        })
        newCount++
      }

      totalNew += newCount
      console.log(`  Found ${videos.length} results, added ${newCount} new`)
      await sleep(2000)
    }

    return { success: true, message: `爬取完成，新增 ${totalNew} 条资源` }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Crawl failed:', message)
    throw createError({ statusCode: 500, statusMessage: '爬取失败: ' + message })
  } finally {
    crawlInProgress = false
  }
})
