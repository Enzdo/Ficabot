import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_hospitalizations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')
      table.integer('pet_id').unsigned().nullable()
      table.string('pet_name').notNullable()
      table.string('pet_species').nullable()
      table.string('client_name').notNullable()
      table.string('client_phone').nullable()
      table.date('admission_date').notNullable()
      table.date('expected_discharge').nullable()
      table.date('actual_discharge').nullable()
      table.string('reason').notNullable()
      table.text('diagnosis').nullable()
      table.text('treatment_plan').nullable()
      table.string('status').notNullable().defaultTo('active') // active, discharged, deceased
      table.string('cage_number').nullable()
      table.text('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
