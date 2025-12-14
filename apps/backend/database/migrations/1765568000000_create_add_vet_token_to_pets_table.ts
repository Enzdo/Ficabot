import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('vet_token').unique().nullable()
      table.timestamp('vet_token_expires_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('vet_token')
      table.dropColumn('vet_token_expires_at')
    })
  }
}
