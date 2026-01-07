export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
  ],

  ssr: true,

  app: {
    head: {
      title: 'Ficabot - Le compagnon santé de vos animaux',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ficabot - Application de suivi santé pour vos animaux de compagnie. Carnet de santé numérique, rappels vaccins, connexion vétérinaire.' },
        { name: 'keywords', content: 'animaux, santé, vétérinaire, carnet de santé, vaccins, chien, chat, NAC' },
        { property: 'og:title', content: 'Ficabot - Le compagnon santé de vos animaux' },
        { property: 'og:description', content: 'Application de suivi santé pour vos animaux de compagnie' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-01-01',
})
