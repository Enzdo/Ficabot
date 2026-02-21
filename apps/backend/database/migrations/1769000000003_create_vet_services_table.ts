import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_services'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')
      table.string('name').notNullable()
      table.integer('duration').notNullable().defaultTo(30)
      table.decimal('price', 10, 2).notNullable().defaultTo(0)
      table.string('icon').nullable().defaultTo('🩺')
      table.string('color_class').nullable().defaultTo('bg-primary-100')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
