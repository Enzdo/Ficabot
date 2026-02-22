import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_external_clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('veterinarian_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')

      table.string('email').notNullable()
      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.string('phone').nullable()
      table.text('notes').nullable()
      table.timestamp('invite_sent_at').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['veterinarian_id', 'email'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
