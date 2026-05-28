<template>
  <div class="pt-20 lg:pt-24 pb-12 lg:pb-20">

    <!-- Header -->
    <div class="container-custom mb-10 lg:mb-12 text-center pt-8 lg:pt-12">
      <h1 class="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 mb-4 lg:mb-6 leading-tight">
        Le Blog <span class="gradient-text">Ficana</span>
      </h1>
      <p class="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-8">
        Conseils santé, éducation et bien-être pour prendre soin de vos compagnons au quotidien.
      </p>

      <!-- Barre de recherche -->
      <div class="max-w-lg mx-auto relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher un article…"
          class="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-sm transition"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Filtres catégories + toggle favoris -->
    <div class="container-custom mb-10 lg:mb-12">
      <div class="flex flex-wrap gap-2 justify-center items-center">
        <button
          @click="categoryFilter = 'all'; showBookmarkedOnly = false"
          :class="['px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border', categoryFilter === 'all' && !showBookmarkedOnly ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600']"
        >
          Tous
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          @click="categoryFilter = cat; showBookmarkedOnly = false"
          :class="['px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border', categoryFilter === cat && !showBookmarkedOnly ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600']"
        >
          {{ cat }}
        </button>
        <!-- Séparateur + bouton favoris -->
        <div class="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
        <button
          v-if="bookmarkedSlugs.length"
          @click="showBookmarkedOnly = !showBookmarkedOnly; categoryFilter = 'all'"
          :class="['flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border', showBookmarkedOnly ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-600']"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          Mes favoris ({{ bookmarkedSlugs.length }})
        </button>
      </div>
    </div>

    <!-- Message recherche vide -->
    <div v-if="searchQuery && !hasResults" class="container-custom text-center py-16">
      <p class="text-4xl mb-4">🐾</p>
      <p class="text-gray-600 text-lg font-medium mb-2">Aucun article trouvé pour « {{ searchQuery }} »</p>
      <button @click="searchQuery = ''" class="text-primary-600 text-sm underline underline-offset-2">Effacer la recherche</button>
    </div>

    <template v-else>
      <!-- Featured Article (uniquement sur "Tous" sans recherche) -->
      <section class="container-custom mb-16 lg:mb-20" v-if="featuredPost && categoryFilter === 'all' && !searchQuery && !showBookmarkedOnly">
        <NuxtLink :to="`/blog/${featuredPost.slug}`" class="relative rounded-2xl lg:rounded-[2rem] overflow-hidden group block">
          <img :src="featuredPost.image" :alt="featuredPost.title" class="w-full h-[400px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <span class="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider rounded-md mb-3 lg:mb-4">{{ featuredPost.category }}</span>
            <h2 class="text-2xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 group-hover:text-primary-300 transition-colors leading-tight">
              {{ featuredPost.title }}
            </h2>
            <p class="text-gray-300 mb-4 lg:mb-6 max-w-2xl text-base lg:text-lg line-clamp-2 hidden sm:block">
              {{ featuredPost.excerpt }}
            </p>
            <div class="flex flex-wrap items-center gap-3 lg:gap-4 text-white/80 text-xs lg:text-sm">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white border border-white/30">
                  {{ featuredPost.author[0] }}
                </div>
                <span class="font-medium">{{ featuredPost.author }}</span>
              </div>
              <span class="hidden sm:inline">•</span>
              <span>{{ featuredPost.date }}</span>
              <span class="hidden sm:inline">•</span>
              <span>{{ featuredPost.readTime }} de lecture</span>
            </div>
          </div>
          <!-- Bookmark sur le featured -->
          <button
            @click.prevent="toggleBookmark(featuredPost.slug)"
            :class="['absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm', isBookmarked(featuredPost.slug) ? 'bg-amber-400 text-white' : 'bg-white/20 text-white hover:bg-white/40']"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </NuxtLink>
      </section>

      <!-- Articles Grid -->
      <section class="container-custom">
        <!-- Titre contextuel si recherche active -->
        <div v-if="searchQuery" class="mb-6">
          <p class="text-sm text-gray-500">
            <strong class="text-gray-900">{{ displayedPosts.length }}</strong> résultat{{ displayedPosts.length > 1 ? 's' : '' }} pour « {{ searchQuery }} »
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <article v-for="post in displayedPosts" :key="post.slug" class="group cursor-pointer relative">
            <NuxtLink :to="`/blog/${post.slug}`" class="block h-full flex flex-col">
              <div class="rounded-xl lg:rounded-2xl overflow-hidden mb-4 relative">
                <img :src="post.image" :alt="post.title" class="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
                <div class="absolute top-3 right-3 lg:top-4 lg:right-4 bg-white/90 backdrop-blur px-2 lg:px-3 py-1 rounded-lg text-xs font-bold text-gray-900">
                  {{ post.category }}
                </div>
                <!-- Recherche : highlight badge -->
                <div v-if="searchQuery" class="absolute bottom-3 left-3 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Résultat
                </div>
              </div>
              <div class="flex-1 flex flex-col">
                <!-- Titre avec highlight -->
                <h3
                  class="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight"
                  v-html="highlightText(post.title)"
                ></h3>
                <p class="text-sm lg:text-base text-gray-600 mb-4 line-clamp-3 flex-1"
                   v-html="highlightText(post.excerpt)"></p>
                <div class="flex items-center justify-between mt-auto">
                  <span class="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 text-sm">
                    Lire l'article
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ post.readTime }}
                  </span>
                </div>
              </div>
            </NuxtLink>
            <!-- Bouton bookmark sur la carte -->
            <button
              @click.prevent="toggleBookmark(post.slug)"
              :class="['absolute top-3 left-3 lg:top-4 lg:left-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100', isBookmarked(post.slug) ? '!opacity-100 bg-amber-400 text-white' : 'bg-white/80 text-gray-500 hover:bg-amber-100 hover:text-amber-500']"
              :title="isBookmarked(post.slug) ? 'Retirer des favoris' : 'Sauvegarder'"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            </button>
          </article>
        </div>

        <!-- Newsletter -->
        <div v-if="!searchQuery" class="mt-16 lg:mt-20 bg-gray-900 rounded-2xl lg:rounded-3xl p-6 lg:p-8 flex flex-col justify-center text-center relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative z-10">
            <div class="w-10 h-10 lg:w-12 lg:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl lg:text-2xl mx-auto mb-4">
              📬
            </div>
            <h3 class="text-xl lg:text-2xl font-bold text-white mb-2">Restez informé</h3>
            <p class="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Recevez nos conseils santé et bien-être pour votre animal chaque mois.
            </p>
            <form @submit.prevent class="space-y-3 max-w-md mx-auto w-full">
              <input type="email" placeholder="Votre email" class="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm lg:text-base" />
              <button class="w-full btn bg-primary-600 text-white hover:bg-primary-500 text-sm lg:text-base">
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

const route = useRoute()
// [VETO-PRIVATE] Filtre forcé sur 'owner' tant que la partie pro reste privée
const targetFilter = ref<'pro' | 'owner'>('owner')
const categoryFilter = ref<string>('all')
const searchQuery = ref<string>('')
const showBookmarkedOnly = ref(false)

// Optional ?species=dog,cat,nac filter from query string (deep-link from mobile app)
const speciesFilter = computed(() => {
  const q = route.query.species
  if (!q) return undefined
  return String(q).split(',').map((s) => s.trim()).filter(Boolean)
})

// Dynamic posts from backend API
const { data: ownerPostsData } = useBlogPosts({
  target: targetFilter.value,
  species: speciesFilter.value,
})
const ownerPosts = computed(() => ownerPostsData.value ?? [])

// ── Bookmarks (localStorage) ─────────────────────────────────────────
const bookmarkedSlugs = ref<string[]>([])

onMounted(() => {
  try {
    const saved = localStorage.getItem('ficana-bookmarks')
    bookmarkedSlugs.value = saved ? JSON.parse(saved) : []
  } catch { bookmarkedSlugs.value = [] }
})

const isBookmarked = (slug: string) => bookmarkedSlugs.value.includes(slug)

const toggleBookmark = (slug: string) => {
  const idx = bookmarkedSlugs.value.indexOf(slug)
  if (idx === -1) bookmarkedSlugs.value.push(slug)
  else bookmarkedSlugs.value.splice(idx, 1)
  localStorage.setItem('ficana-bookmarks', JSON.stringify(bookmarkedSlugs.value))
}

// ── Recherche ────────────────────────────────────────────────────────
const normalise = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const highlightText = (text: string) => {
  if (!searchQuery.value) return text
  const q = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${q})`, 'gi')
  return text.replace(re, '<mark class="bg-primary-100 text-primary-800 rounded px-0.5">$1</mark>')
}

// ── Posts filtrés ────────────────────────────────────────────────────
const categories = computed(() => [...new Set(ownerPosts.value.map((p) => p.category))])

const searchFilteredPosts = computed(() => {
  if (!searchQuery.value) return ownerPosts.value
  const q = normalise(searchQuery.value)
  return ownerPosts.value.filter((p) =>
    normalise(p.title).includes(q) || normalise(p.excerpt).includes(q) || normalise(p.category).includes(q)
  )
})

const featuredPost = computed(() => ownerPosts.value[0])

const displayedPosts = computed(() => {
  if (showBookmarkedOnly.value) {
    return ownerPosts.value.filter((p) => bookmarkedSlugs.value.includes(p.slug))
  }
  if (searchQuery.value) return searchFilteredPosts.value
  if (categoryFilter.value === 'all') return ownerPosts.value.slice(1)
  return ownerPosts.value.filter((p) => p.category === categoryFilter.value)
})

const hasResults = computed(() => displayedPosts.value.length > 0)
</script>
