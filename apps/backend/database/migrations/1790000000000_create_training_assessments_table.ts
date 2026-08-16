import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_assessments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()

      // Réponses brutes : { questionId: optionValue }. Conservées pour pouvoir
      // recalculer les notes si la grille évolue, sans refaire passer le test.
      table.json('answers').notNullable()
      table.json('context').notNullable()

      // Notes par axe : { obedience: 62, recall: 40, ... }
      table.json('scores').notNullable()
      table.integer('overall_score').notNullable()
      table.string('level', 20).notNullable()

      // Le plan est généré à part (Premium), donc nullable et suivi par un statut.
      table.json('plan').nullable()
      table.string('plan_status', 20).notNullable().defaultTo('none')
      table.text('plan_error').nullable()
      table.boolean('plan_from_ai').notNullable().defaultTo(false)
      table.timestamp('plan_generated_at').nullable()

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.now())

      table.index(['pet_id', 'created_at'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
