import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_premium').notNullable().defaultTo(false)
      table.timestamp('premium_since').nullable()
      table.timestamp('premium_expires_at').nullable()
      table.string('premium_plan', 30).nullable() // 'monthly' | 'yearly' | 'lifetime'
      table.string('premium_provider', 30).nullable() // 'stripe' | 'revenuecat' | 'manual'
      table.string('premium_subscription_id', 200).nullable()
    })
    this.schema.raw('CREATE INDEX IF NOT EXISTS users_is_premium_index ON users(is_premium)')
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS users_is_premium_index')
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'is_premium',
        'premium_since',
        'premium_expires_at',
        'premium_plan',
        'premium_provider',
        'premium_subscription_id'
      )
    })
  }
}
