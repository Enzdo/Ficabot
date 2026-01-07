import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_veterinarians'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      
      table
        .integer('veterinarian_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')
      
      // Status: pending, accepted, rejected
      table.string('status').defaultTo('pending')
      
      // Who initiated the link (user or vet)
      table.string('initiated_by').notNullable() // 'user' or 'vet'
      
      // Optional note from the initiator
      table.text('note').nullable()
      
      // Is this the user's primary vet?
      table.boolean('is_primary').defaultTo(false)
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Unique constraint to prevent duplicate links
      table.unique(['user_id', 'veterinarian_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
