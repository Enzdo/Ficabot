import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vet_clinics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Google Places ID for verification
      table.string('place_id').unique().notNullable()
      
      // Clinic info from Google Places
      table.string('name').notNullable()
      table.text('address').notNullable()
      table.decimal('latitude', 10, 8).notNullable()
      table.decimal('longitude', 11, 8).notNullable()
      table.string('phone').nullable()
      table.string('website').nullable()
      table.float('rating').nullable()
      table.integer('user_ratings_total').nullable()
      table.json('opening_hours').nullable()
      table.string('photo_reference').nullable()
      
      // Verification status
      table.boolean('is_verified').defaultTo(false)
      table.timestamp('verified_at').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
