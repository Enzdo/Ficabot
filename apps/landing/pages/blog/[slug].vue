<template>
  <!-- Barre de progression lecture (fixe en haut) -->
  <div
    class="fixed top-0 left-0 z-50 h-[3px] bg-primary-500 transition-all duration-75"
    :style="{ width: scrollProgress + '%' }"
    aria-hidden="true"
  ></div>

  <div class="bg-hero pt-24 lg:pt-32 pb-16 lg:pb-24">
    <article v-if="post" class="container-custom">
      <div class="max-w-3xl mx-auto">

        <!-- Header nav -->
        <div class="flex items-center justify-between mb-6 lg:mb-8">
          <NuxtLink to="/blog" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-700 transition-colors">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour au blog
          </NuxtLink>
          <span class="chip-primary">{{ post.category }}</span>
        </div>

        <!-- Titre -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-5 leading-tight">
          {{ post.title }}
        </h1>

        <p class="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
          {{ post.excerpt }}
        </p>

        <!-- Meta + actions inline -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700 text-sm">
                {{ post.author[0] }}
              </div>
              <span class="font-medium text-gray-900">{{ post.author }}</span>
            </div>
            <span>·</span>
            <span>{{ post.date }}</span>
            <span>·</span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ post.readTime }}
            </span>
          </div>

          <!-- Boutons partage dans la meta -->
          <div class="flex items-center gap-2">
            <!-- Bookmark -->
            <button
              @click="toggleBookmark"
              :title="bookmarked ? 'Retirer des favoris' : 'Sauvegarder'"
              :class="['flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200', bookmarked ? 'bg-primary-50 border-primary-300 text-primary-600' : 'bg-white border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-500']"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
            <!-- Partager -->
            <button
              @click="showShare = !showShare"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 text-xs font-medium transition-all duration-200 bg-white"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              Partager
            </button>
          </div>
        </div>

        <!-- Panel partage (sous les meta) -->
        <Transition name="slide-down">
          <div v-if="showShare" class="mb-8 p-4 rounded-xl border border-gray-200 bg-white shadow-soft">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Partager cet article</p>
            <div class="flex flex-wrap gap-2">
              <button
                @click="copyLink"
                :class="['flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200', copied ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-primary-600']"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path v-if="!copied" stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {{ copied ? 'Copié !' : 'Copier le lien' }}
              </button>
              <a
                :href="twitterUrl"
                target="_blank" rel="noopener"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all duration-200"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857-8.175-10.643H8.08l4.259 5.625zM17.083 20.5h1.834L7.084 4.126H5.117z"/></svg>
                X / Twitter
              </a>
              <a
                :href="whatsappUrl"
                target="_blank" rel="noopener"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-200"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </Transition>

        <!-- Image hero -->
        <img
          :src="post.image"
          :alt="post.title"
          class="w-full h-[250px] sm:h-[350px] lg:h-[440px] object-cover rounded-card mb-10 lg:mb-12 border border-gray-200"
        />

        <!-- Table des matières (si >= 2 sections) -->
        <nav v-if="tocItems.length >= 2" class="mb-10 p-5 rounded-xl border border-primary-100 bg-primary-50/50">
          <p class="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h10"/></svg>
            Dans cet article
          </p>
          <ol class="space-y-1.5">
            <li v-for="(item, i) in tocItems" :key="i">
              <a
                :href="`#${item.id}`"
                @click.prevent="scrollToHeading(item.id)"
                :class="['flex items-center gap-2 text-sm py-0.5 transition-colors', activeHeading === item.id ? 'text-primary-700 font-semibold' : 'text-gray-600 hover:text-primary-600']"
              >
                <span :class="['flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold', activeHeading === item.id ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600']">{{ i + 1 }}</span>
                {{ item.text }}
              </a>
            </li>
          </ol>
        </nav>

        <!-- Contenu article -->
        <div class="article-content" v-html="processedContent"></div>

        <!-- Barre like + partage après l'article -->
        <div class="mt-12 py-6 border-t border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              @click="toggleLike"
              :class="['group flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-semibold text-sm transition-all duration-300', liked ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600']"
            >
              <span :class="['transition-transform duration-300', liked ? 'scale-125' : 'group-hover:scale-110']">🐾</span>
              <span>{{ liked ? 'Article utile !' : 'Article utile ?' }}</span>
              <span :class="['text-xs rounded-full px-2 py-0.5', liked ? 'bg-primary-400 text-white' : 'bg-gray-100 text-gray-500']">{{ likeCount }}</span>
            </button>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>Partager :</span>
            <a :href="twitterUrl" target="_blank" rel="noopener" class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857-8.175-10.643H8.08l4.259 5.625zM17.083 20.5h1.834L7.084 4.126H5.117z"/></svg>
            </a>
            <a :href="whatsappUrl" target="_blank" rel="noopener" class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:border-[#25D366] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <button @click="copyLink" class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-400 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path v-if="!copied" stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- CTA bas d'article -->
        <div class="mt-14 lg:mt-16 pt-10 border-t border-gray-200">
          <div class="rounded-card p-6 lg:p-8" style="background:linear-gradient(135deg,#EBF3DE 0%,#F5EEE4 100%);border:1px solid rgba(126,177,63,0.25)">
            <h2 class="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Continuez avec Ficana</h2>
            <p class="text-sm lg:text-base text-gray-700 mb-5">
              Le carnet de santé numérique pour vos animaux. Gratuit pour démarrer, installable depuis l'App Store et Google Play.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink to="/particuliers" class="btn-primary">Découvrir l'app</NuxtLink>
              <NuxtLink to="/blog" class="btn-secondary">Plus d'articles</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Articles liés -->
        <div v-if="relatedPosts.length" class="mt-14 lg:mt-16">
          <h2 class="text-xl lg:text-2xl font-bold text-gray-900 mb-6">À lire aussi</h2>
          <div class="grid sm:grid-cols-2 gap-5">
            <NuxtLink
              v-for="r in relatedPosts"
              :key="r.slug"
              :to="`/blog/${r.slug}`"
              class="card-hover !p-5 flex gap-4 group"
            >
              <img :src="r.image" :alt="r.title" class="w-20 h-20 sm:w-24 sm:h-24 rounded-mmd object-cover flex-shrink-0" />
              <div class="min-w-0 flex flex-col justify-center">
                <p class="text-xs font-semibold text-primary-700 mb-1">{{ r.category }}</p>
                <h3 class="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">{{ r.title }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ r.readTime }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </article>

    <div v-else class="min-h-[50vh] flex flex-col items-center justify-center container-custom text-center">
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Article non trouvé</h1>
      <p class="text-gray-600 mb-8">L'article que vous cherchez n'existe pas ou a été déplacé.</p>
      <NuxtLink to="/blog" class="btn-primary">Retour au blog</NuxtLink>
    </div>

    <!-- Bouton scroll-to-top -->
    <Transition name="fade-up">
      <button
        v-if="showScrollTop"
        @click="scrollTop"
        class="fixed bottom-6 right-6 z-40 w-11 h-11 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="Retour en haut"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

const route = useRoute()
const { getPostBySlug, posts } = useBlog()
const post = computed(() => getPostBySlug(route.params.slug as string))

const relatedPosts = computed(() => {
  if (!post.value) return []
  return posts
    .filter((p: { slug: string; category: string }) => p.category === post.value!.category && p.slug !== post.value!.slug)
    .slice(0, 4)
})

// ── Lecture progress ─────────────────────────────────────────────────
const scrollProgress = ref(0)
const showScrollTop = ref(false)

const onScroll = () => {
  const el = document.documentElement
  const scrolled = el.scrollTop || document.body.scrollTop
  const total = el.scrollHeight - el.clientHeight
  scrollProgress.value = total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0
  showScrollTop.value = scrolled > 400
  updateActiveHeading()
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

// ── Table des matières ───────────────────────────────────────────────
interface TocItem { id: string; text: string }
const tocItems = ref<TocItem[]>([])
const activeHeading = ref<string>('')

const processedContent = computed(() => {
  if (!post.value?.content) return ''
  let idx = 0
  return post.value.content.replace(/<h2([^>]*)>/g, (_match: string, attrs: string) => {
    const id = `section-${idx++}`
    return `<h2${attrs} id="${id}">`
  })
})

const buildToc = () => {
  if (!post.value?.content) return
  const tmp: TocItem[] = []
  let idx = 0
  const re = /<h2[^>]*>(.*?)<\/h2>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(post.value.content)) !== null) {
    tmp.push({ id: `section-${idx++}`, text: m[1].replace(/<[^>]+>/g, '') })
  }
  tocItems.value = tmp
  if (tmp.length) activeHeading.value = tmp[0].id
}

const scrollToHeading = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

const updateActiveHeading = () => {
  for (let i = tocItems.value.length - 1; i >= 0; i--) {
    const el = document.getElementById(tocItems.value[i].id)
    if (el && el.getBoundingClientRect().top <= 120) {
      activeHeading.value = tocItems.value[i].id
      return
    }
  }
  if (tocItems.value.length) activeHeading.value = tocItems.value[0].id
}

onMounted(() => buildToc())
watch(() => post.value?.slug, () => buildToc())

// ── Like ─────────────────────────────────────────────────────────────
const liked = ref(false)
const likeCount = ref(0)
const BASE_LIKES = 12

const loadLike = () => {
  if (!post.value?.slug) return
  liked.value = localStorage.getItem(`ficana-like-${post.value.slug}`) === '1'
  const saved = parseInt(localStorage.getItem(`ficana-likecount-${post.value.slug}`) || '')
  likeCount.value = isNaN(saved) ? BASE_LIKES : saved
}

const toggleLike = () => {
  if (!post.value?.slug) return
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
  localStorage.setItem(`ficana-like-${post.value.slug}`, liked.value ? '1' : '0')
  localStorage.setItem(`ficana-likecount-${post.value.slug}`, String(likeCount.value))
}

// ── Bookmark ─────────────────────────────────────────────────────────
const bookmarked = ref(false)
const loadBookmark = () => {
  if (!post.value?.slug) return
  bookmarked.value = localStorage.getItem(`ficana-bm-${post.value.slug}`) === '1'
}
const toggleBookmark = () => {
  if (!post.value?.slug) return
  bookmarked.value = !bookmarked.value
  localStorage.setItem(`ficana-bm-${post.value.slug}`, bookmarked.value ? '1' : '0')
}

onMounted(() => { loadLike(); loadBookmark() })
watch(() => post.value?.slug, () => { loadLike(); loadBookmark() })

// ── Share ─────────────────────────────────────────────────────────────
const showShare = ref(false)
const copied = ref(false)

const twitterUrl = computed(() => {
  if (!post.value) return '#'
  const text = encodeURIComponent(`${post.value.title} — via @Ficana`)
  const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
})

const whatsappUrl = computed(() => {
  if (!post.value) return '#'
  const text = encodeURIComponent(`${post.value.title} ${typeof window !== 'undefined' ? window.location.href : ''}`)
  return `https://wa.me/?text=${text}`
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false; showShare.value = false }, 2000)
  } catch { /* ignore */ }
}

useHead({
  title: post.value ? `${post.value.title} — Ficana` : 'Article non trouvé — Ficana',
  meta: [
    { name: 'description', content: post.value?.excerpt || 'Article du blog Ficana' },
  ],
})
</script>

<style scoped>
/* Article content */
.article-content :deep(.lead) {
  font-size: 1.125rem; line-height: 1.7; color: #4D4038; margin-bottom: 2rem; font-weight: 500;
}
.article-content :deep(h2) {
  font-size: 1.5rem; font-weight: 700; color: #1A1614; margin-top: 2.5rem; margin-bottom: 1rem;
  letter-spacing: -0.01em; line-height: 1.25; scroll-margin-top: 90px;
}
.article-content :deep(h3) {
  font-size: 1.15rem; font-weight: 700; color: #1A1614; margin-top: 1.75rem; margin-bottom: 0.75rem;
}
.article-content :deep(p) {
  font-size: 1rem; line-height: 1.75; color: #4D4038; margin-bottom: 1.25rem;
}
.article-content :deep(ul), .article-content :deep(ol) {
  margin: 0 0 1.5rem; padding-left: 1.5rem;
}
.article-content :deep(ul) { list-style: disc; }
.article-content :deep(ol) { list-style: decimal; }
.article-content :deep(li) { font-size: 1rem; line-height: 1.7; color: #4D4038; margin-bottom: 0.5rem; }
.article-content :deep(li::marker) { color: #7EB13F; }
.article-content :deep(strong) { font-weight: 600; color: #1A1614; }
.article-content :deep(a) { color: #5C8A2A; text-decoration: underline; text-underline-offset: 2px; }
.article-content :deep(a:hover) { color: #2e3a2f; }
.article-content :deep(blockquote) {
  border-left: 3px solid #7EB13F; padding-left: 1rem; margin: 1.5rem 0; color: #6B5E52; font-style: italic;
}
@media (min-width: 1024px) {
  .article-content :deep(.lead) { font-size: 1.25rem; }
  .article-content :deep(h2) { font-size: 1.75rem; margin-top: 3rem; }
}

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.25s ease;
  max-height: 200px; overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0; transform: translateY(-6px); max-height: 0;
}

.fade-up-enter-active, .fade-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-up-enter-from, .fade-up-leave-to {
  opacity: 0; transform: translateY(8px);
}
</style>
