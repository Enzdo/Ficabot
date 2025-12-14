import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medical_records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.enum('type', ['vaccine', 'treatment', 'visit']).notNullable()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.date('date').notNullable()
      table.date('next_due_date').nullable()
      table.string('vet_name').nullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
