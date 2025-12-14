import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_appointments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('vet_name').nullable()
      table.string('vet_address').nullable()
      table.string('vet_phone').nullable()
      table.date('appointment_date').notNullable()
      table.time('appointment_time').nullable()
      table.string('status').defaultTo('scheduled') // scheduled, completed, cancelled
      table.text('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}