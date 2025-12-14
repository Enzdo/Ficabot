import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'health_books'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pet_id')
        .unsigned()
        .references('id')
        .inTable('pets')
        .onDelete('CASCADE')
        .unique() // One health book per pet

      // Identification (encrypted)
      table.text('identification_number').nullable()
      table.string('identification_type').nullable() // 'microchip' | 'tattoo'
      table.string('identification_date').nullable()
      table.text('identification_location').nullable()

      // Passport (encrypted)
      table.text('passport_number').nullable()
      table.string('passport_issue_date').nullable()
      table.text('passport_issue_location').nullable()

      // Sterilization
      table.boolean('is_sterilized').defaultTo(false)
      table.string('sterilization_date').nullable()
      table.text('sterilization_vet_name').nullable()

      // Blood type (encrypted)
      table.text('blood_type').nullable()

      // Medical records (encrypted JSON arrays)
      table.text('vaccines').nullable()
      table.text('antiparasitics').nullable()
      table.text('dewormings').nullable()
      table.text('surgeries').nullable()
      table.text('allergies').nullable()
      table.text('chronic_conditions').nullable()
      table.text('medications').nullable()
      table.text('vet_visits').nullable()
      table.text('weight_history').nullable()

      // Insurance (encrypted)
      table.text('insurance_company').nullable()
      table.text('insurance_policy_number').nullable()
      table.string('insurance_expiry_date').nullable()

      // Emergency vet (encrypted)
      table.text('emergency_vet_name').nullable()
      table.text('emergency_vet_phone').nullable()
      table.text('emergency_vet_address').nullable()

      // Notes (encrypted)
      table.text('notes').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
