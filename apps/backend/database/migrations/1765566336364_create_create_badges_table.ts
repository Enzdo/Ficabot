import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'badges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code').unique().notNullable()
      table.string('name').notNullable()
      table.text('description').notNullable()
      table.string('icon').notNullable()
      table.string('category').notNullable() // health, activity, care, social, milestone
      table.integer('points').defaultTo(10)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}