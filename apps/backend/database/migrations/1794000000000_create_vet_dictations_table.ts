import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Travaux de dictée différés.
 *
 * La transcription tenait la requête ouverte de bout en bout : sur une longue
 * dictée, un onglet fermé ou une coupure réseau perdait tout. L'état vit
 * désormais en base, le navigateur s'y raccroche.
 *
 * L'audio n'a pas sa place ici : il est supprimé dès la transcription faite,
 * et c'est le navigateur qui en garde la copie le temps du traitement.
 */
export default class extends BaseSchema {
  protected tableName = 'vet_dictations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('veterinarian_id')
        .unsigned()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')
        .notNullable()

      // pending → transcribing → structuring → done | failed
      table.string('status').notNullable().defaultTo('pending')

      table.string('language').notNullable().defaultTo('fr')
      table.string('template_id').nullable()
      table.text('instruction').nullable()
      // Jeton d'accès au dossier de l'animal, pas une clé étrangère : une dictée
      // peut très bien n'être rattachée à aucun patient.
      table.string('pet_token').nullable()

      table.text('transcript').nullable()
      table.text('draft').nullable()
      table.text('error_message').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.timestamp('completed_at', { useTz: true }).nullable()

      // Ce que le navigateur interroge en se reconnectant : les dictées encore
      // en cours d'un praticien, les plus récentes d'abord.
      table.index(['veterinarian_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
