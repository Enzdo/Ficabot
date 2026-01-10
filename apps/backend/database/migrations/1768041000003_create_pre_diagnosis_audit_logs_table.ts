import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'pre_diagnosis_audit_logs'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.integer('pre_diagnosis_id').unsigned().notNullable().references('id').inTable('pre_diagnoses').onDelete('CASCADE')
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.integer('veterinarian_id').unsigned().nullable().references('id').inTable('veterinarians').onDelete('SET NULL')

            table.enum('action', ['created', 'ai_analyzed', 'synthesized', 'viewed', 'shared', 'downloaded']).notNullable()
            table.string('ip_address', 45).notNullable()
            table.string('user_agent', 500).notNullable()
            table.boolean('disclaimer_accepted').notNullable().defaultTo(false)
            table.json('metadata').nullable()

            table.timestamp('created_at').notNullable().defaultTo(this.now())

            // Indexes
            table.index('pre_diagnosis_id')
            table.index('user_id')
            table.index('action')
            table.index('created_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
