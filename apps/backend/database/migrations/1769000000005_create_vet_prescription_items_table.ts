import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_prescription_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('prescription_id').unsigned().notNullable().references('id').inTable('vet_prescriptions').onDelete('CASCADE')
      table.string('medication_name').notNullable()
      table.string('dosage').notNullable()
      table.string('frequency').notNullable()
      table.string('duration').notNullable()
      table.text('instructions').nullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
