<template>
  <div class="card resource-card">
    <div class="card-header" :class="resource.type === 'pattern' ? 'header-pattern' : 'header-video'">
      <img v-if="resource.image_url || resource.imageUrl" :src="proxyImg((resource.image_url || resource.imageUrl) as string)" :alt="resource.title" class="resource-image" />
      <div v-else class="resource-icon">
        {{ resource.type === 'pattern' ? '📐' : '🎬' }}
      </div>
      <span v-if="resource.platform" class="source-badge">
        {{ $t(`platform.${resource.platform}`, resource.platform as string) }}
      </span>
    </div>
    <div class="card-body">
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <span class="tag" :class="resource.type === 'pattern' ? 'tag-pink' : 'tag-blue'">
          {{ resource.type === 'pattern' ? $t('resources.pattern') : $t('resources.video') }}
        </span>
        <span class="tag tag-purple">{{ categoryLabel }}</span>
      </div>
      <h3 class="card-title">{{ resource.title }}</h3>
      <div v-if="resource.type === 'video' && (resource.platform || resource.author)" class="author-info">
        <span v-if="resource.platform" class="platform-label">{{ platformLabel }}</span>
        <span v-if="resource.author" class="author-name">@{{ resource.author }}</span>
      </div>
      <p class="card-text">{{ (resource.description || '').slice(0, 80) }}</p>
      <div class="card-actions">
        <a v-if="resource.type === 'video' && (resource.video_url || resource.videoUrl)" href="#" class="btn btn-sm btn-outline" @click.prevent="handleJump((resource.video_url || resource.videoUrl) as string)">{{ $t('resources.watchVideo') }}</a>
        <a v-if="resource.type === 'pattern' && (resource.file_url || resource.fileUrl)" href="#" class="btn btn-sm btn-outline" @click.prevent="handleJump((resource.file_url || resource.fileUrl) as string)">{{ $t('resources.viewPattern') }}</a>
        <span v-if="resource.platform" class="source-text">{{ $t('resources.from') }} {{ $t(`platform.${resource.platform}`, resource.platform as string) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{ resource: Record<string, unknown> }>()
const { proxyImg } = useImageProxy()

const categoryKeys: Record<string, string> = { doll: 'doll', scarf: 'scarf', bag: 'bag', hat: 'hat', blanket: 'blanket', other: 'other' }
const categoryLabel = categoryKeys[props.resource.category as string]
  ? t(`resources.${categoryKeys[props.resource.category as string]}`)
  : props.resource.category as string

const platformLabel = props.resource.platform
  ? t(`platform.${props.resource.platform}`, props.resource.platform as string)
  : ''

function handleJump(url: string) {
  if (!url) return
  if (url === '#') {
    alert(t('resources.noLink'))
    return
  }
  try {
    const urlObj = new URL(url)
    const confirmed = confirm(t('resources.jumpConfirm', { host: urlObj.hostname }))
    if (confirmed) {
      window.open(url, '_blank')
    }
  } catch {
    alert(t('resources.linkError'))
  }
}
</script>

<style scoped>
.resource-card { height: 100%; display: flex; flex-direction: column; }
.card-header {
  height: 140px; display: flex; align-items: center; justify-content: center;
  position: relative; border-radius: 16px 16px 0 0; overflow: hidden;
}
.resource-image { width: 100%; height: 100%; object-fit: cover; }
.header-pattern { background: linear-gradient(135deg, #D4EDE4 0%, #E8F5F0 100%); }
.header-video { background: linear-gradient(135deg, #FFF4E0 0%, #FFF8E8 100%); }
.resource-icon { line-height: 1; opacity: 0.8; color: var(--primary-dark); }
.source-badge {
  position: absolute; top: 12px; right: 12px;
  background: rgba(0,0,0,0.6); color: #fff;
  font-size: 0.75rem; padding: 4px 12px; border-radius: 12px; font-weight: 500;
}
.author-info { display: flex; align-items: center; gap: 8px; margin: 8px 0 10px; font-size: 0.85rem; }
.platform-label { color: var(--primary-dark); font-weight: 500; }
.author-name { color: var(--text-light); }
.card-actions { margin-top: 16px; display: flex; align-items: center; gap: 10px; }
@media (max-width: 480px) {
  .card-header { height: 120px; }
  .resource-icon { font-size: 3.5rem; }
  .author-info { font-size: 0.8rem; }
}
</style>
