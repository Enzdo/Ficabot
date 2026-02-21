import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_reminders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')
      table.integer('pet_id').unsigned().nullable()
      table.integer('user_id').unsigned().nullable()
      table.string('pet_name').nullable()
      table.string('client_name').nullable()
      table.string('type').notNullable().defaultTo('vaccine')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.date('due_date').notNullable()
      table.string('status').notNullable().defaultTo('pending')
      table.timestamp('sent_at').nullable()
      table.timestamp('completed_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
