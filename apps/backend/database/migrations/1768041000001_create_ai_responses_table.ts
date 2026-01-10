import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'ai_responses'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.integer('pre_diagnosis_id').unsigned().notNullable().references('id').inTable('pre_diagnoses').onDelete('CASCADE')

            table.enum('model', ['claude', 'gpt', 'gemini']).notNullable()
            table.json('raw_response').notNullable()
            table.json('hypotheses').notNullable()
            table.json('urgent_signs').notNullable()
            table.decimal('confidence', 3, 2).notNullable().defaultTo(0)
            table.integer('processing_time_ms').notNullable()

            table.enum('status', ['success', 'failed']).notNullable().defaultTo('success')
            table.text('error_message').nullable()

            table.timestamp('created_at').notNullable().defaultTo(this.now())

            // Indexes
            table.index('pre_diagnosis_id')
            table.index(['pre_diagnosis_id', 'model'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
