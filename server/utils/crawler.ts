// B站搜索关键词 → 资源分类映射
const searchQueries = [
  { keyword: '钩针玩偶教程', category: 'doll' },
  { keyword: '毛线玩偶钩法', category: 'doll' },
  { keyword: '钩织围巾教程', category: 'scarf' },
  { keyword: '围巾编织教学', category: 'scarf' },
  { keyword: '钩针包包教程', category: 'bag' },
  { keyword: '毛线包包编织', category: 'bag' },
  { keyword: '钩织帽子教程', category: 'hat' },
  { keyword: '钩针毯子教程', category: 'blanket' },
  { keyword: '钩织入门教程', category: 'other' },
  { keyword: '钩针基础教学', category: 'other' },
]

function stripHtml(str: string): string {
  if (!str) return ''
  return str.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

function fixImageUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('//')) return 'https:' + url
  return url
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface BilibiliVideo {
  title: string
  description: string
  imageUrl: string | null
  videoUrl: string
  author: string
}

async function fetchBilibiliVideos(keyword: string, retries = 3): Promise<BilibiliVideo[]> {
  const url = `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(keyword)}&page=1&page_size=20`

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://search.bilibili.com',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) })
      const text = await res.text()

      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        console.warn(`  [attempt ${attempt}/${retries}] "${keyword}" hit rate limit`)
        if (attempt < retries) {
          await sleep(3000 * attempt)
          continue
        }
        return []
      }

      const json = JSON.parse(text)
      if (json.code !== 0) return []

      const results = json.data?.result || []
      return results.map((item: Record<string, unknown>) => ({
        title: stripHtml(item.title as string),
        description: stripHtml((item.description as string) || ''),
        imageUrl: fixImageUrl(item.pic as string | null),
        videoUrl: `https://www.bilibili.com/video/${item.bvid}`,
        author: item.author as string,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`  [attempt ${attempt}/${retries}] Fetch error for "${keyword}": ${message}`)
      if (attempt < retries) {
        await sleep(2000 * attempt)
        continue
      }
      return []
    }
  }
  return []
}

export { searchQueries, fetchBilibiliVideos, sleep }
