/**
 * Queue Worker
 * Processes Bull jobs in background
 *
 * Usage:
 * node ace worker:start
 * or
 * node bin/worker.js (after build)
 */

import 'reflect-metadata'
import { Ignitor, prettyPrint } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start()
  .then(async () => {
    console.log('🚀 Queue Worker Started')

    // Import and initialize job processors
    const { default: PreDiagnosisJob } = await import('#jobs/pre_diagnosis_job')
    new PreDiagnosisJob()

    console.log('✅ Pre-Diagnosis Job Processor Registered')
    console.log('👀 Watching for jobs...\n')
  })
  .catch((error) => {
    process.exitCode = 1
    prettyPrint(error)
  })
