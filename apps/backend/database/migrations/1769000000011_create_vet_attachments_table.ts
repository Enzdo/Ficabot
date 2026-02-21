import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_attachments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')
      table.integer('pet_id').unsigned().nullable()
      table.string('pet_name').nullable()
      table.string('category').notNullable().defaultTo('other') // xray, lab, photo, document, other
      table.string('file_name').notNullable()
      table.string('file_path').notNullable()
      table.string('file_type').notNullable()
      table.integer('file_size').notNullable().defaultTo(0)
      table.text('description').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
