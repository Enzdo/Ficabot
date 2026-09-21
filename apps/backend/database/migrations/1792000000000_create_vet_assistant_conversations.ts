import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Conversations avec l'assistant.
 *
 * Chaque vétérinaire retrouve ses échanges d'une session à l'autre.
 * Une conversation peut être rattachée à un patient — dans ce cas
 * l'assistant répond avec son dossier sous les yeux — ou rester générale.
 */
export default class extends BaseSchema {
  protected tableName = 'vet_assistant_conversations'

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
      // Patient concerné, facultatif : une conversation peut être générale
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('SET NULL').nullable()
      table.string('title').notNullable().defaultTo('Nouvelle discussion')
      table.timestamp('last_message_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['veterinarian_id', 'last_message_at'])
    })

    this.schema.createTable('vet_assistant_messages', (table) => {
      table.increments('id')
      table
        .integer('conversation_id')
        .unsigned()
        .references('id')
        .inTable(this.tableName)
        .onDelete('CASCADE')
        .notNullable()
      table.enum('role', ['user', 'assistant']).notNullable()
      table.text('content').notNullable()
      // Sources citées par la réponse, en JSON
      table.text('sources').nullable()
      table.timestamp('created_at')

      table.index(['conversation_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable('vet_assistant_messages')
    this.schema.dropTable(this.tableName)
  }
}
