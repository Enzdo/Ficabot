import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [assert(), apiClient(), pluginAdonisJS(app)]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
/**
 * Garde-fou : plusieurs suites appellent `testUtils.db().truncate()`. Avec un
 * `.env` qui pointe sur la base hébergée, lancer les tests vide la production —
 * c'est arrivé. On refuse de démarrer tant que la base n'est pas locale, ou que
 * `ALLOW_DESTRUCTIVE_TESTS=true` n'est pas explicitement posé.
 */
function assertDatabaseIsDisposable() {
  if (process.env.ALLOW_DESTRUCTIVE_TESTS === 'true') return

  const url = process.env.DATABASE_URL ?? ''
  const host = url ? new URL(url).hostname : (process.env.DB_HOST ?? '')
  const isLocal = ['localhost', '127.0.0.1', '::1', 'db', 'postgres'].includes(host) || host === ''

  if (!isLocal) {
    throw new Error(
      `Les tests effacent la base (TRUNCATE). Celle configurée est distante : ${host}.\n` +
        `Pointez DB_HOST/DATABASE_URL sur une base locale jetable, ou posez ` +
        `ALLOW_DESTRUCTIVE_TESTS=true si vous voulez vraiment l'effacer.`
    )
  }
}

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [() => assertDatabaseIsDisposable()],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
