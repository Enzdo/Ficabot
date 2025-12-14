import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weight_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.decimal('weight', 5, 2).notNullable()
      table.date('recorded_at').notNullable()
      table.string('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}