import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_chat_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      table
        .integer('user_veterinarian_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('user_veterinarians')
        .onDelete('CASCADE')
      
      // Who sent the message
      table.string('sender_type').notNullable() // 'user' or 'vet'
      table.integer('sender_id').unsigned().notNullable()
      
      table.text('content').notNullable()
      
      // Optional attachment (image, document)
      table.string('attachment_url').nullable()
      table.string('attachment_type').nullable() // image, document, etc.
      
      table.boolean('is_read').defaultTo(false)
      table.timestamp('read_at').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
