<template>
  <div class="pt-20 lg:pt-24 pb-12 lg:pb-20">
    <!-- Header -->
    <div class="container-custom mb-12 lg:mb-16 text-center pt-8 lg:pt-12">
      <div class="inline-flex bg-gray-100 p-1 rounded-xl gap-2 mb-6 lg:mb-8">
        <button 
          @click="targetFilter = 'pro'"
          :class="['px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-sm font-medium transition-all duration-200', targetFilter === 'pro' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
        >
          Vétérinaires
        </button>
        <button 
          @click="targetFilter = 'owner'"
          :class="['px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-sm font-medium transition-all duration-200', targetFilter === 'owner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
        >
          Propriétaires
        </button>
      </div>

      <h1 class="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 mb-4 lg:mb-6 leading-tight">
        Le Blog <span class="gradient-text">Ficabot {{ targetFilter === 'pro' ? 'Pro' : 'Family' }}</span>
      </h1>
      <p class="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
        {{ targetFilter === 'pro' 
          ? 'Conseils, actualités et guides pour moderniser votre cabinet vétérinaire et améliorer l\'expérience client.'
          : 'Conseils santé, éducation et bien-être pour prendre soin de vos compagnons au quotidien.'
        }}
      </p>
    </div>

    <!-- Featured Article -->
    <section class="container-custom mb-16 lg:mb-20" v-if="featuredPost">
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
      </NuxtLink>
    </section>

    <!-- Articles Grid -->
    <section class="container-custom">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <article v-for="post in regularPosts" :key="post.slug" class="group cursor-pointer">
          <NuxtLink :to="`/blog/${post.slug}`" class="block h-full flex flex-col">
            <div class="rounded-xl lg:rounded-2xl overflow-hidden mb-4 relative">
              <img :src="post.image" :alt="post.title" class="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute top-3 right-3 lg:top-4 lg:right-4 bg-white/90 backdrop-blur px-2 lg:px-3 py-1 rounded-lg text-xs font-bold text-gray-900">
                {{ post.category }}
              </div>
            </div>
            <div class="flex-1 flex flex-col">
              <h3 class="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                {{ post.title }}
              </h3>
              <p class="text-sm lg:text-base text-gray-600 mb-4 line-clamp-3 flex-1">
                {{ post.excerpt }}
              </p>
              <span class="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 text-sm mt-auto">
                Lire l'article
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- Newsletter Card -->
      <div class="mt-16 lg:mt-20 bg-gray-900 rounded-2xl lg:rounded-3xl p-6 lg:p-8 flex flex-col justify-center text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 lg:w-12 lg:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl lg:text-2xl mx-auto mb-4">
            📬
          </div>
          <h3 class="text-xl lg:text-2xl font-bold text-white mb-2">Restez informé</h3>
          <p class="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            {{ targetFilter === 'pro' 
              ? 'Recevez nos derniers articles et conseils de gestion chaque mois.'
              : 'Recevez nos conseils santé et bien-être pour votre animal chaque mois.'
            }}
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { posts } = useBlog()
const targetFilter = ref<'pro' | 'owner'>('pro')

const filteredPosts = computed(() => posts.filter(post => post.target === targetFilter.value))

const featuredPost = computed(() => filteredPosts.value[0])
const regularPosts = computed(() => filteredPosts.value.slice(1))
</script>
