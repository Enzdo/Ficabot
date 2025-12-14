import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shopping_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE').nullable()
      table.string('name').notNullable()
      table.string('category').notNullable() // food, treats, toys, accessories, hygiene, health, other
      table.integer('quantity').defaultTo(1)
      table.string('unit').nullable()
      table.boolean('is_completed').defaultTo(false)
      table.string('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}