export function useImageProxy() {
  function proxyImg(url: string | null | undefined): string {
    if (!url) return ''
    if (url.startsWith('/')) return url
    return '/api/image-proxy?url=' + encodeURIComponent(url)
  }

  return { proxyImg }
}
