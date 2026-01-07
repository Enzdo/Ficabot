import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'veterinarians'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('clinic_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('vet_clinics')
        .onDelete('SET NULL')
      
      // Verification status for the vet at this clinic
      table.string('verification_status').defaultTo('pending') // pending, verified, rejected
      table.text('verification_note').nullable()
      table.timestamp('verification_requested_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('clinic_id')
      table.dropColumn('clinic_id')
      table.dropColumn('verification_status')
      table.dropColumn('verification_note')
      table.dropColumn('verification_requested_at')
    })
  }
}
