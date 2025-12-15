/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

let appRoot = new URL('../', import.meta.url)

/**
 * When running from the "build" directory, the "env.js" file is located
 * inside "build/start" directory. So we need to go up 2 levels to
 * reach the application root.
 */
if (appRoot.pathname.endsWith('/build/')) {
  appRoot = new URL('../', appRoot)
}

export default await Env.create(appRoot, {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  /*
  |--------------------------------------------------------------------------
  | Database
  |--------------------------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_SSL: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | OpenAI
  |--------------------------------------------------------------------------
  */
  OPENAI_API_KEY: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Encryption
  |--------------------------------------------------------------------------
  */
  ENCRYPTION_KEY: Env.schema.string(),
})
