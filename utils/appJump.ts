/**
 * Third-party e-commerce app jump utility
 * Supports Taobao, Tmall, Pinduoduo, JD
 */

export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function isWeChat(): boolean {
  if (typeof navigator === 'undefined') return false
  return /MicroMessenger/i.test(navigator.userAgent)
}

function extractProductId(url: string, platform: string): string | null {
  try {
    switch (platform) {
      case '淘宝':
      case '天猫': {
        const idMatch = url.match(/[?&]id=(\d+)/)
        return idMatch ? idMatch[1] : null
      }
      case '拼多多': {
        const goodsMatch = url.match(/goods_id=(\d+)/)
        return goodsMatch ? goodsMatch[1] : null
      }
      case '京东': {
        const jdMatch = url.match(/\/(\d+)\.html/)
        return jdMatch ? jdMatch[1] : null
      }
      default:
        return null
    }
  } catch {
    return null
  }
}

function generateAppScheme(platform: string, url: string): string | null {
  const productId = extractProductId(url, platform)

  switch (platform) {
    case '淘宝':
    case '天猫':
      if (productId) return `taobao://item.taobao.com/item.htm?id=${productId}`
      return `taobao://` + url.replace(/^https?:\/\//, '')
    case '拼多多':
      if (productId) return `pinduoduo://com.xunmeng.pinduoduo/goods_detail.html?goods_id=${productId}`
      return null
    case '京东':
      if (productId) return `openapp.jdmobile://virtual?params={"category":"jump","des":"productDetail","productId":"${productId}"}`
      return null
    default:
      return null
  }
}

interface SmartJumpOptions {
  platform: string
  url: string
  onSuccess?: (type: string) => void
  onFail?: (reason: string) => void
}

export function smartJump({ platform, url, onSuccess, onFail }: SmartJumpOptions): void {
  if (!isMobile()) {
    window.open(url, '_blank')
    onSuccess?.('web')
    return
  }

  if (isWeChat()) {
    alert('请点击右上角"..."，选择"在浏览器中打开"以获得最佳体验')
    onFail?.('wechat')
    return
  }

  const appScheme = generateAppScheme(platform, url)

  if (!appScheme) {
    window.location.href = url
    onSuccess?.('web')
    return
  }

  const startTime = Date.now()
  const timer = setTimeout(() => {
    const endTime = Date.now()
    if (endTime - startTime < 2000) {
      window.location.href = url
      onFail?.('timeout')
    }
  }, 1500)

  const visibilityChange = () => {
    if (document.hidden) {
      clearTimeout(timer)
      onSuccess?.('app')
    }
  }

  document.addEventListener('visibilitychange', visibilityChange)
  window.location.href = appScheme

  setTimeout(() => {
    document.removeEventListener('visibilitychange', visibilityChange)
  }, 3000)
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    '淘宝': '🛒', '天猫': '🐱', '拼多多': '🛍️',
    '京东': '📦', '1688': '🏭', '闲鱼': '🐟',
  }
  return icons[platform] || '🔗'
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    '淘宝': '#FF6600', '天猫': '#FF0036', '拼多多': '#E02E24',
    '京东': '#E3393C', '1688': '#FF6600', '闲鱼': '#FFAE00',
  }
  return colors[platform] || '#666'
}
