<template>
  <nav class="navbar">
    <div class="container">
      <NuxtLink to="/" class="navbar-brand">
        <span>🧶</span> {{ $t('brand') }}
      </NuxtLink>
      <button class="mobile-toggle" @click="menuOpen = !menuOpen">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="navbar-right">
        <ul class="navbar-nav" :class="{ open: menuOpen }">
          <li><NuxtLink to="/" @click="menuOpen = false">{{ $t('nav.home') }}</NuxtLink></li>
          <li><NuxtLink to="/products" @click="menuOpen = false">{{ $t('nav.products') }}</NuxtLink></li>
          <li><NuxtLink to="/resources" @click="menuOpen = false">{{ $t('nav.resources') }}</NuxtLink></li>
          <li><NuxtLink to="/forum" @click="menuOpen = false">{{ $t('nav.forum') }}</NuxtLink></li>
          <li>
            <button class="theme-toggle" @click="toggleTheme" :title="isDark ? $t('nav.lightMode') : $t('nav.darkMode')">
              <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" fill="currentColor"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </li>
        </ul>
        <button class="lang-switch" @click="toggleLang">
          🌐 {{ $t('lang.switchTo') }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const menuOpen = ref(false)
const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDark.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
})

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

function toggleLang() {
  const next = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = next
  localStorage.setItem('locale', next)
}
</script>

<style scoped>
.theme-toggle {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 24px;
  transition: var(--transition);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}
.theme-toggle:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
@media (max-width: 768px) {
  .navbar-nav.open .theme-toggle {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }
}
</style>
