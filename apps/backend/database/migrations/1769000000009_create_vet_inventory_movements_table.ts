import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_inventory_movements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('item_id').unsigned().notNullable().references('id').inTable('vet_inventory_items').onDelete('CASCADE')
      table.string('type').notNullable() // in, out, adjustment
      table.integer('quantity').notNullable()
      table.string('reason').nullable()
      table.string('reference').nullable()
      table.text('notes').nullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
