import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_appointments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add veterinarian reference
      table
        .integer('veterinarian_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')
      
      // Add employee reference
      table
        .integer('employee_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('vet_employees')
        .onDelete('SET NULL')
      
      // For non-registered clients
      table.string('client_name').nullable()
      table.string('client_phone').nullable()
      table.string('client_email').nullable()
      table.string('pet_species').nullable()
      
      // Appointment time details
      table.time('start_time').nullable()
      table.time('end_time').nullable()
      table.integer('duration').defaultTo(30)
      
      // Type and status
      table.string('type').defaultTo('consultation')
      
      // Internal notes
      table.text('internal_notes').nullable()
      
      // Recurring
      table.boolean('is_recurring').defaultTo(false)
      table.string('recurrence_pattern').nullable()
      table.integer('parent_appointment_id').unsigned().nullable()
      
      // Reminders
      table.boolean('reminder_sent').defaultTo(false)
      table.timestamp('reminder_sent_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('veterinarian_id')
      table.dropColumn('employee_id')
      table.dropColumn('client_name')
      table.dropColumn('client_phone')
      table.dropColumn('client_email')
      table.dropColumn('pet_species')
      table.dropColumn('start_time')
      table.dropColumn('end_time')
      table.dropColumn('duration')
      table.dropColumn('type')
      table.dropColumn('internal_notes')
      table.dropColumn('is_recurring')
      table.dropColumn('recurrence_pattern')
      table.dropColumn('parent_appointment_id')
      table.dropColumn('reminder_sent')
      table.dropColumn('reminder_sent_at')
    })
  }
}
