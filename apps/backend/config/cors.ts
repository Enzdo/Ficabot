import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */

/**
 * Origines autorisées.
 *
 * Pilotable sans redéploiement de code via CORS_ORIGINS, une liste séparée
 * par des virgules. Ex. :
 *   CORS_ORIGINS=https://app.ficana.fr,https://www.ficana.fr
 *
 * Sans cette variable, on retombe sur la liste ci-dessous. `credentials: true`
 * interdit le joker `*` : chaque origine doit être énumérée.
 */
const fallbackOrigins = [
  // Production
  'https://app.ficana.fr', // espace vétérinaire (apps/vet-frontend)
  'https://ficana-vet.vercel.app', // même app, domaine Vercel
  'https://pro.ficana.fr', // site professionnel (apps/pro-landing)
  'https://www.ficana.fr', // site grand public (apps/landing)
  'https://ficana.fr',
  // Développement local
  'http://localhost:3000', // frontend
  'http://localhost:3001', // vet-frontend
  'http://localhost:3002', // landing
  'http://localhost:3003', // pro-landing
]

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsConfig = defineConfig({
  enabled: true,
  origin: configuredOrigins.length > 0 ? configuredOrigins : fallbackOrigins,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
