import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'pre_diagnoses'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.integer('pet_id').unsigned().notNullable().references('id').inTable('pets').onDelete('CASCADE')
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.integer('veterinarian_id').unsigned().nullable().references('id').inTable('veterinarians').onDelete('SET NULL')

            table.enum('species', ['dog', 'cat']).notNullable()
            table.text('user_description').notNullable()
            table.json('image_urls').notNullable()

            table.enum('status', ['pending', 'processing', 'completed', 'failed']).notNullable().defaultTo('pending')
            table.enum('urgency_level', ['low', 'medium', 'high', 'critical']).nullable()

            table.timestamp('created_at').notNullable().defaultTo(this.now())
            table.timestamp('completed_at').nullable()

            // Indexes
            table.index('pet_id')
            table.index('user_id')
            table.index('status')
            table.index('created_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
