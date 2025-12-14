import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_badges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('badge_id').unsigned().references('id').inTable('badges').onDelete('CASCADE')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE').nullable()
      table.timestamp('earned_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['user_id', 'badge_id', 'pet_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}