import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('share_token').unique().nullable()
      table.boolean('is_public').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('share_token')
      table.dropColumn('is_public')
    })
  }
}