import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_appointments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Rename appointment_date -> date
      table.renameColumn('appointment_date', 'date')

      // Add missing columns used by ClinicAppointment model
      table.string('pet_name').nullable()
      table.string('reason').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('date', 'appointment_date')
      table.dropColumn('pet_name')
      table.dropColumn('reason')
    })
  }
}
