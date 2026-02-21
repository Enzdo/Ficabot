import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_hospitalization_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('hospitalization_id').unsigned().notNullable().references('id').inTable('vet_hospitalizations').onDelete('CASCADE')
      table.string('type').notNullable().defaultTo('note') // note, medication, feeding, vitals, observation
      table.text('content').notNullable()
      table.json('data').nullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
