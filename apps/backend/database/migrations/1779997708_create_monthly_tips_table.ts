import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'monthly_tips'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('species', 10).notNullable() // 'dog' | 'cat' | 'nac'
      table.integer('month').notNullable() // 1-12
      table.string('title', 200).notNullable()
      table.text('body').notNullable()
      table.string('emoji', 10).nullable()
      table.text('image_url').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.now())

      table.index(['species', 'month'])
      table.unique(['species', 'month']) // 1 conseil par espèce/mois
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
