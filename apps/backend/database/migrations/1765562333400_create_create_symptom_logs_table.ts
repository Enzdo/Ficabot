import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'symptom_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.string('symptom').notNullable()
      table.string('severity').defaultTo('mild') // mild, moderate, severe
      table.text('description').nullable()
      table.date('observed_at').notNullable()
      table.time('observed_time').nullable()
      table.integer('duration_minutes').nullable()
      table.boolean('is_resolved').defaultTo(false)
      table.text('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}