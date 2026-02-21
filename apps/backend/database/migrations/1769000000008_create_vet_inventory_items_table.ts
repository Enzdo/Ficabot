import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_inventory_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('category').notNullable().defaultTo('medication')
      table.string('sku').nullable()
      table.integer('quantity').notNullable().defaultTo(0)
      table.string('unit').notNullable().defaultTo('unité')
      table.integer('min_stock').notNullable().defaultTo(5)
      table.decimal('price', 10, 2).notNullable().defaultTo(0)
      table.string('supplier').nullable()
      table.date('expiry_date').nullable()
      table.text('notes').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
