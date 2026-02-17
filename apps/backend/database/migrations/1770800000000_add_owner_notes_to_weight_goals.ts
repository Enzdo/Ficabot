import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weight_goals'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('owner_notes').nullable().after('vet_notes')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('owner_notes')
    })
  }
}
