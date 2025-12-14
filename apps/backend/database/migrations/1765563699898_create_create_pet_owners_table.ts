import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pet_owners'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('role').defaultTo('member') // owner = propriétaire principal, member = co-propriétaire
      table.string('status').defaultTo('pending') // pending, accepted, rejected
      table.string('invited_by_email').nullable() // email utilisé pour l'invitation
      table.timestamp('invited_at').nullable()
      table.timestamp('accepted_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Un utilisateur ne peut être lié qu'une fois à un animal
      table.unique(['pet_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}