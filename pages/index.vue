<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1>{{ $t('home.heroTitle') }}</h1>
          <p>{{ $t('home.heroSubtitle') }}</p>
          <div class="hero-actions">
            <NuxtLink to="/resources" class="btn btn-primary">{{ $t('home.heroAction') }}</NuxtLink>
            <NuxtLink to="/products" class="btn btn-secondary">{{ $t('home.browseProducts') }}</NuxtLink>
          </div>
        </div>
        <div class="hero-visual">
          <span class="hero-emoji">🧶</span>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.featuresTitle') }}</h2>
        <p class="section-desc">{{ $t('home.featuresDesc') }}</p>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🧶</div>
            <h3>{{ $t('home.featureProducts') }}</h3>
            <p>{{ $t('home.featureProductsDesc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📖</div>
            <h3>{{ $t('home.featureResources') }}</h3>
            <p>{{ $t('home.featureResourcesDesc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>{{ $t('home.featureForum') }}</h3>
            <p>{{ $t('home.featureForumDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Products -->
    <section class="section" style="background:var(--bg-card)">
      <div class="container">
        <h2 class="section-title">{{ $t('home.hotProducts') }}</h2>
        <p class="section-desc">{{ $t('home.hotProductsDesc') }}</p>
        <div class="grid grid-4" v-if="products && products.length">
          <ProductCard v-for="p in products.slice(0, 4)" :key="p.id" :product="p" />
        </div>
        <div v-else-if="productError" class="error-state">{{ $t('home.loadFailed') }}</div>
        <div class="loading" v-else>{{ $t('home.loading') }}</div>
        <div style="text-align:center;margin-top:30px">
          <NuxtLink to="/products" class="btn btn-outline">{{ $t('home.viewAllProducts') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Latest Resources -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.latestResources') }}</h2>
        <p class="section-desc">{{ $t('home.latestResourcesDesc') }}</p>
        <div class="grid grid-3" v-if="resources && resources.length">
          <ResourceCard v-for="r in resources.slice(0, 3)" :key="r.id" :resource="r" />
        </div>
        <div v-else-if="resourceError" class="error-state">{{ $t('home.loadFailed') }}</div>
        <div class="loading" v-else>{{ $t('home.loading') }}</div>
        <div style="text-align:center;margin-top:30px">
          <NuxtLink to="/resources" class="btn btn-outline">{{ $t('home.viewAllResources') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Latest Posts -->
    <section class="section" style="background:var(--bg-card)">
      <div class="container">
        <h2 class="section-title">{{ $t('home.communityUpdates') }}</h2>
        <p class="section-desc">{{ $t('home.communityUpdatesDesc') }}</p>
        <div class="post-list" v-if="posts && posts.length">
          <PostCard v-for="p in posts.slice(0, 5)" :key="p.id" :post="p" />
        </div>
        <div v-else-if="postError" class="error-state">{{ $t('home.loadFailed') }}</div>
        <div class="loading" v-else>{{ $t('home.loading') }}</div>
        <div style="text-align:center;margin-top:30px">
          <NuxtLink to="/forum" class="btn btn-outline">{{ $t('home.enterForum') }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data: products, error: productError } = await useFetch('/api/products', { query: { limit: 4 } })
const { data: resources, error: resourceError } = await useFetch('/api/resources', { query: { limit: 3 } })
const { data: posts, error: postError } = await useFetch('/api/posts', { query: { limit: 5 } })
</script>
