import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weight_goals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE')
      table.decimal('start_weight', 5, 2).notNullable()
      table.decimal('target_weight', 5, 2).notNullable()
      table.decimal('current_weight', 5, 2).notNullable()
      table.date('start_date').notNullable()
      table.date('target_date').nullable()
      table.string('goal_type').defaultTo('lose') // lose, gain, maintain
      table.text('vet_notes').nullable() // Notes du vétérinaire
      table.text('diet_plan').nullable() // Plan alimentaire recommandé
      table.text('exercise_plan').nullable() // Plan d'exercice recommandé
      table.integer('daily_calories').nullable() // Calories journalières recommandées
      table.string('food_type').nullable() // Type de nourriture recommandée
      table.decimal('food_quantity', 5, 2).nullable() // Quantité journalière en grammes
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_completed').defaultTo(false)
      table.date('completed_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}