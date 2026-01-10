import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'synthesis_results'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.integer('pre_diagnosis_id').unsigned().notNullable().references('id').inTable('pre_diagnoses').onDelete('CASCADE').unique()

            table.json('prioritized_hypotheses').notNullable()
            table.json('urgent_signs').notNullable()
            table.json('general_recommendations').notNullable()
            table.text('user_friendly_summary').notNullable()
            table.text('disclaimer').notNullable()
            table.enum('overall_urgency', ['low', 'medium', 'high', 'critical']).notNullable()

            table.timestamp('synthesized_at').notNullable().defaultTo(this.now())

            // Indexes
            table.index('pre_diagnosis_id')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
