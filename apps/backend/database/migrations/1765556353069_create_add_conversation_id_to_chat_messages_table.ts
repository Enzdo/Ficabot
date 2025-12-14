import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_messages'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('conversation_id').nullable().index()
      table.string('conversation_title').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('conversation_id')
      table.dropColumn('conversation_title')
    })
  }
}