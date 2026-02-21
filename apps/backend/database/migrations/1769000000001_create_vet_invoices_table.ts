import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_invoices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')
      table.string('number').notNullable().unique()
      table.string('client_name').notNullable()
      table.string('client_email').nullable()
      table.string('pet_name').nullable()
      table.date('date').notNullable()
      table.date('due_date').notNullable()
      table.decimal('subtotal', 10, 2).notNullable().defaultTo(0)
      table.decimal('tax_rate', 5, 2).notNullable().defaultTo(20)
      table.decimal('tax', 10, 2).notNullable().defaultTo(0)
      table.decimal('total', 10, 2).notNullable().defaultTo(0)
      table.string('status').notNullable().defaultTo('draft') // draft, pending, paid, overdue
      table.text('notes').nullable()
      table.timestamp('paid_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
