import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Trace la reprise d'un compte rendu.
 *
 * Les comptes rendus n'étaient jamais relus par le logiciel vétérinaire, donc
 * jamais modifiés : la question de savoir quand ils l'avaient été ne se posait
 * pas. Elle se pose dès qu'ils deviennent modifiables — en médical, un compte
 * rendu amendé après coup ne doit pas être indiscernable de l'original.
 *
 * Initialisée à la date de création : les lignes existantes n'ont jamais été
 * reprises, et laisser un vide se lirait comme une information manquante.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('medical_records', (table) => {
      table.timestamp('updated_at').nullable()
    })

    this.defer(async (db) => {
      await db.rawQuery('UPDATE medical_records SET updated_at = created_at WHERE updated_at IS NULL')
    })
  }

  async down() {
    this.schema.alterTable('medical_records', (table) => {
      table.dropColumn('updated_at')
    })
  }
}
