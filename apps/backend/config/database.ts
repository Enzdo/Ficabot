import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const databaseUrl = env.get('DATABASE_URL', '')

// Parse DATABASE_URL manually to avoid pg-connection-string bugs
function parseDbUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
  }
}

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: databaseUrl
        ? parseDbUrl(databaseUrl)
        : {
            host: env.get('DB_HOST'),
            port: env.get('DB_PORT'),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
            ssl: env.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
