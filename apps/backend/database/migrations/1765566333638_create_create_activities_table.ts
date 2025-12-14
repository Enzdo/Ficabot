import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.string('type').notNullable() // walk, play, training, grooming, other
      table.integer('duration_minutes').nullable()
      table.decimal('distance_km', 5, 2).nullable()
      table.text('notes').nullable()
      table.timestamp('started_at').notNullable()
      table.timestamp('ended_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}