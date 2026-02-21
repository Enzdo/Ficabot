import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_prescriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')
      table.integer('pet_id').unsigned().nullable()
      table.integer('user_id').unsigned().nullable()
      table.integer('appointment_id').unsigned().nullable()
      table.date('date').notNullable()
      table.string('pet_name').nullable()
      table.string('client_name').nullable()
      table.text('diagnosis').nullable()
      table.text('notes').nullable()
      table.string('status').notNullable().defaultTo('active')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
