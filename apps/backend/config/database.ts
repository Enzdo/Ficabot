import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const databaseUrl = env.get('DATABASE_URL', '')

// Parse DATABASE_URL manually to avoid pg-connection-string bugs with special chars
function parseDbUrl(url: string) {
  let parsed: URL
  try {
    // Try parsing as-is first (URL already valid / password already encoded)
    parsed = new URL(url)
  } catch {
    // Password contains unencoded special chars (e.g. ?) — encode it first
    const safeUrl = url.replace(
      /^(postgresql?:\/\/[^:]+):([^@]+)@/,
      (_match, prefix, password) => `${prefix}:${encodeURIComponent(password)}@`
    )
    parsed = new URL(safeUrl)
  }
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
  }
}

const individualParams = {
  host: env.get('DB_HOST'),
  port: env.get('DB_PORT'),
  user: env.get('DB_USER'),
  password: env.get('DB_PASSWORD'),
  database: env.get('DB_DATABASE'),
  ssl: env.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
}

let resolvedConnection: any
if (databaseUrl) {
  try {
    resolvedConnection = parseDbUrl(databaseUrl)
  } catch {
    resolvedConnection = individualParams
  }
} else {
  resolvedConnection = individualParams
}

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: resolvedConnection,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
