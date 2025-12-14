import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reminders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.string('type').notNullable() // vaccine, antiparasitic, weighing, appointment, custom
      table.string('title').notNullable()
      table.text('description').nullable()
      table.date('due_date').notNullable()
      table.time('due_time').nullable()
      table.boolean('is_completed').defaultTo(false)
      table.boolean('is_recurring').defaultTo(false)
      table.string('recurrence_interval').nullable() // daily, weekly, monthly, yearly
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}