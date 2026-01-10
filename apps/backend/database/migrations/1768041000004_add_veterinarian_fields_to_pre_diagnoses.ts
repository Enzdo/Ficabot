import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'pre_diagnoses'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.timestamp('veterinarian_notified_at').nullable()
            table.timestamp('veterinarian_viewed_at').nullable()
            table.text('veterinarian_response').nullable()
            table.timestamp('veterinarian_response_at').nullable()
            table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium')
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('veterinarian_notified_at')
            table.dropColumn('veterinarian_viewed_at')
            table.dropColumn('veterinarian_response')
            table.dropColumn('veterinarian_response_at')
            table.dropColumn('priority')
        })
    }
}
