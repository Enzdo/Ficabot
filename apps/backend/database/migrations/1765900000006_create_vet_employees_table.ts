import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_employees'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      table
        .integer('veterinarian_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')
      
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('email').nullable()
      table.string('phone').nullable()
      table.string('avatar_url').nullable()
      
      // Role: vet (veterinarian), assistant, receptionist, etc.
      table.string('role').notNullable().defaultTo('assistant')
      
      // Specializations (JSON array)
      table.json('specializations').nullable()
      
      // Working hours (JSON object with days and hours)
      table.json('working_hours').nullable()
      
      // Color for calendar display
      table.string('color').defaultTo('#0d9488')
      
      table.boolean('is_active').defaultTo(true)
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
