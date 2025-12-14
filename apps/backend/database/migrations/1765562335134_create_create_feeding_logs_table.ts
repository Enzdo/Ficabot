import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'feeding_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.string('food_type').notNullable() // dry, wet, raw, homemade, treats
      table.string('brand').nullable()
      table.string('product_name').nullable()
      table.float('quantity').nullable()
      table.string('unit').defaultTo('g') // g, kg, ml, cups
      table.date('fed_at').notNullable()
      table.time('fed_time').nullable()
      table.text('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}