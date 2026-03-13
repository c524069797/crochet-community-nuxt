export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url || (!url.startsWith('https://') && !url.startsWith('http://'))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': new URL(url).origin + '/',
        'Accept': 'image/*,*/*',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw createError({ statusCode: response.status, statusMessage: 'Failed to fetch image' })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await response.arrayBuffer())

    setHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=604800, immutable',
      'X-Image-Proxy': 'true',
    })

    return buffer
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw createError({ statusCode: 502, statusMessage: 'Image proxy failed: ' + message })
  }
})
