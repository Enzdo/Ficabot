import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'vet_notifications'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.integer('veterinarian_id').unsigned().notNullable().references('id').inTable('veterinarians').onDelete('CASCADE')

            table.enum('type', ['new_pre_diagnosis', 'new_client', 'urgent_case', 'message']).notNullable()
            table.string('title', 200).notNullable()
            table.text('message').notNullable()

            table.string('related_entity_type', 50).nullable()
            table.integer('related_entity_id').nullable()

            table.boolean('is_read').defaultTo(false)
            table.timestamp('read_at').nullable()

            table.timestamp('created_at').notNullable().defaultTo(this.now())

            // Indexes
            table.index('veterinarian_id')
            table.index(['veterinarian_id', 'is_read'])
            table.index('created_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
