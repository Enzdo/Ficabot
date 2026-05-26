<template>
  <div class="bg-hero pt-24 lg:pt-32 pb-16 lg:pb-24">
    <article v-if="post" class="container-custom">
      <div class="max-w-3xl mx-auto">
        <NuxtLink to="/blog" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-700 mb-6 lg:mb-8 transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au blog
        </NuxtLink>

        <span class="chip-primary mb-5">{{ post.category }}</span>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-5 leading-tight">
          {{ post.title }}
        </h1>

        <p class="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
          {{ post.excerpt }}
        </p>

        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-10 pb-8 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700 text-sm">
              {{ post.author[0] }}
            </div>
            <span class="font-medium text-gray-900">{{ post.author }}</span>
          </div>
          <span>·</span>
          <span>{{ post.date }}</span>
          <span>·</span>
          <span>{{ post.readTime }} de lecture</span>
        </div>

        <img
          :src="post.image"
          :alt="post.title"
          class="w-full h-[250px] sm:h-[350px] lg:h-[440px] object-cover rounded-card mb-10 lg:mb-12 border border-gray-200"
        />

        <div class="article-content" v-html="post.content"></div>

        <!-- CTA bas d'article — vert Ficana, abonnement via app -->
        <div class="mt-14 lg:mt-16 pt-10 border-t border-gray-200">
          <div class="rounded-card p-6 lg:p-8" style="background:linear-gradient(135deg,#EBF3DE 0%,#F5EEE4 100%);border:1px solid rgba(126,177,63,0.25)">
            <h2 class="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Continuez avec Ficabot</h2>
            <p class="text-sm lg:text-base text-gray-700 mb-5">
              Le carnet de santé numérique pour vos animaux. Gratuit pour démarrer, installable depuis l'App Store et Google Play.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink to="/particuliers" class="btn-primary">Découvrir l'app</NuxtLink>
              <NuxtLink to="/blog" class="btn-secondary">Plus d'articles</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Articles liés (même catégorie) -->
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const { getPostBySlug, posts } = useBlog()
const post = computed(() => getPostBySlug(route.params.slug as string))

const relatedPosts = computed(() => {
  if (!post.value) return []
  return posts
    .filter((p: { slug: string; category: string }) => p.category === post.value!.category && p.slug !== post.value!.slug)
    .slice(0, 4)
})

useHead({
  title: post.value ? `${post.value.title} — Ficabot` : 'Article non trouvé — Ficabot',
  meta: [
    { name: 'description', content: post.value?.excerpt || 'Article du blog Ficabot' },
  ],
})
</script>

<style scoped>
/* [DA-MOBILE] Styling complet du contenu HTML rendu via v-html
   (pas de dépendance @tailwindcss/typography) */
.article-content :deep(.lead) {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #4D4038;
  margin-bottom: 2rem;
  font-weight: 500;
}
.article-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A1614;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.article-content :deep(h3) {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1A1614;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
}
.article-content :deep(p) {
  font-size: 1rem;
  line-height: 1.75;
  color: #4D4038;
  margin-bottom: 1.25rem;
}
.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 0 0 1.5rem;
  padding-left: 1.5rem;
}
.article-content :deep(ul) {
  list-style: disc;
}
.article-content :deep(ol) {
  list-style: decimal;
}
.article-content :deep(li) {
  font-size: 1rem;
  line-height: 1.7;
  color: #4D4038;
  margin-bottom: 0.5rem;
}
.article-content :deep(li::marker) {
  color: #7EB13F;
}
.article-content :deep(strong) {
  font-weight: 600;
  color: #1A1614;
}
.article-content :deep(a) {
  color: #5C8A2A;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.article-content :deep(a:hover) {
  color: #2e3a2f;
}
.article-content :deep(blockquote) {
  border-left: 3px solid #7EB13F;
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #6B5E52;
  font-style: italic;
}

@media (min-width: 1024px) {
  .article-content :deep(.lead) {
    font-size: 1.25rem;
  }
  .article-content :deep(h2) {
    font-size: 1.75rem;
    margin-top: 3rem;
  }
}
</style>
