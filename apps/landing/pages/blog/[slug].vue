<template>
  <div class="pt-24 lg:pt-32 pb-12 lg:pb-20">
    <div v-if="post" class="container-custom">
      <div class="max-w-3xl mx-auto">
        <NuxtLink to="/blog" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 lg:mb-8 transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au blog
        </NuxtLink>

        <div>
          <span class="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider rounded-md mb-4 lg:mb-6">
            {{ post.category }}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 mb-4 lg:mb-6 leading-tight">
          {{ post.title }}
        </h1>

        <div class="flex flex-wrap items-center gap-4 lg:gap-6 text-gray-500 text-xs lg:text-sm mb-8 lg:mb-10 border-b border-gray-100 pb-8 lg:pb-10">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs lg:text-sm">
              {{ post.author[0] }}
            </div>
            <span class="font-medium text-gray-900">{{ post.author }}</span>
          </div>
          <span class="hidden sm:inline">•</span>
          <span>{{ post.date }}</span>
          <span class="hidden sm:inline">•</span>
          <span>{{ post.readTime }} de lecture</span>
        </div>

        <img :src="post.image" :alt="post.title" class="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover rounded-xl lg:rounded-3xl mb-8 lg:mb-12 shadow-xl" />

        <div class="prose prose-lg prose-primary max-w-none text-gray-600" v-html="post.content"></div>

        <!-- Share/CTA -->
        <div class="mt-12 lg:mt-16 pt-8 lg:pt-10 border-t border-gray-100">
          <div class="bg-gray-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-center text-white">
            <h3 class="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Cet article vous a plu ?</h3>
            
            <template v-if="post.target === 'pro'">
              <p class="text-gray-300 mb-6 text-sm lg:text-base">Inscrivez-vous à votre assistant virtuel Pro pour moderniser votre cabinet.</p>
              <a href="http://localhost:3001/register" class="btn bg-primary-600 text-white hover:bg-primary-500 w-full sm:w-auto">
                Essayer gratuitement
              </a>
            </template>
            
            <template v-else>
              <p class="text-gray-300 mb-6 text-sm lg:text-base">Créez le carnet de santé numérique de votre animal dès maintenant.</p>
              <a href="http://localhost:3000/register" class="btn bg-primary-600 text-white hover:bg-primary-500 w-full sm:w-auto">
                Créer mon compte gratuit
              </a>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="min-h-[50vh] flex flex-col items-center justify-center container-custom">
      <h1 class="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
      <p class="text-gray-600 mb-8 text-center">L'article que vous cherchez n'existe pas ou a été déplacé.</p>
      <NuxtLink to="/blog" class="btn-primary">Retour au blog</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const { getPostBySlug } = useBlog()
const post = computed(() => getPostBySlug(route.params.slug as string))

useHead({
  title: post.value ? `${post.value.title} - Blog Votre Assistant Virtuel` : 'Article non trouvé',
  meta: [
    { name: 'description', content: post.value?.excerpt || 'Article de blog Votre Assistant Virtuel Pro' }
  ]
})
</script>

<style>
.prose h2 {
  @apply text-2xl font-bold text-gray-900 mt-10 mb-4;
}
.prose p {
  @apply mb-6 leading-relaxed;
}
</style>
