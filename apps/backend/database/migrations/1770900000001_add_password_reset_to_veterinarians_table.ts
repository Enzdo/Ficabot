import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'veterinarians'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('reset_token').nullable()
      table.timestamp('reset_token_expires_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reset_token')
      table.dropColumn('reset_token_expires_at')
    })
  }
}
