import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.enum('type', [
        'vet_response',
        'pre_diagnosis_completed',
        'appointment_reminder',
        'general'
      ]).notNullable()

      table.string('title', 200).notNullable()
      table.text('message').notNullable()

      // Related entity (optional)
      table.string('related_entity_type', 50).nullable()
      table.integer('related_entity_id').nullable()

      // Read status
      table.boolean('is_read').defaultTo(false).notNullable()
      table.timestamp('read_at').nullable()

      table.timestamp('created_at').notNullable()

      // Indexes
      table.index('user_id')
      table.index(['user_id', 'is_read'])
      table.index('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}