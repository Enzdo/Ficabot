export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  ssr: true,

  app: {
    head: {
      title: 'Ficana Pro — Le logiciel des cliniques vétérinaires',
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Ficana Pro : agenda, dossiers patients, rappels automatiques et lien direct avec vos clients. Le logiciel de gestion des cliniques vétérinaires.',
        },
        { name: 'keywords', content: 'logiciel vétérinaire, gestion clinique vétérinaire, agenda vétérinaire, dossier patient animal' },
        { property: 'og:title', content: 'Ficana Pro — Le logiciel des cliniques vétérinaires' },
        { property: 'og:description', content: 'Agenda, dossiers patients, rappels automatiques et lien direct avec vos clients.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap',
        },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  typescript: { strict: true },

  compatibilityDate: '2024-01-01',

  runtimeConfig: {
    public: {
      // Espace de connexion vétérinaire (apps/vet-frontend)
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3001',
      // Site grand public (apps/landing)
      consumerUrl: process.env.NUXT_PUBLIC_CONSUMER_URL || 'http://localhost:3002',
      // Vidéo de démonstration du hero. Non renseignée, la maquette du produit
      // reste affichée — la page n'est jamais amputée de sa démonstration.
      heroVideo: process.env.NUXT_PUBLIC_HERO_VIDEO || '',
      heroPoster: process.env.NUXT_PUBLIC_HERO_POSTER || '',
      // Stripe Payment Links — de simples URLs, aucune clé n'est exposée ici.
      // Non renseignés, les boutons retombent sur la création de compte.
      stripeLiberal: process.env.NUXT_PUBLIC_STRIPE_LIBERAL || '',
      stripeClinique: process.env.NUXT_PUBLIC_STRIPE_CLINIQUE || '',
    },
  },
})
