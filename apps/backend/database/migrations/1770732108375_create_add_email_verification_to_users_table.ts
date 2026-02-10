import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('email_verified').defaultTo(false).notNullable()
      table.string('verification_token').nullable()
      table.timestamp('verification_token_expires_at').nullable()
      table.timestamp('email_verified_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_verified')
      table.dropColumn('verification_token')
      table.dropColumn('verification_token_expires_at')
      table.dropColumn('email_verified_at')
    })
  }
}