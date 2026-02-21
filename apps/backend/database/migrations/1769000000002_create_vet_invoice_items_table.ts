import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_invoice_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('invoice_id').unsigned().notNullable().references('id').inTable('vet_invoices').onDelete('CASCADE')
      table.string('description').notNullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('unit_price', 10, 2).notNullable()
      table.decimal('total', 10, 2).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
