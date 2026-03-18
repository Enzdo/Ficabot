import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('google_id').nullable().unique().after('email')
      // Make password nullable to support social-only accounts
      table.string('password').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('google_id')
      table.string('password').notNullable().alter()
    })
  }
}
