import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Un bilan est une photo à un instant T ; le programme est ce qui vit dans
    // la durée. Les deux sont séparés pour qu'un bilan hebdomadaire puisse
    // s'accrocher au programme sans écraser le bilan initial.
    this.schema.createTable('training_programs', (table) => {
      table.increments('id').primary()
      table.integer('pet_id').unsigned().references('id').inTable('pets').onDelete('CASCADE').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      table
        .integer('assessment_id')
        .unsigned()
        .references('id')
        .inTable('training_assessments')
        .onDelete('CASCADE')
        .notNullable()

      table.json('plan').notNullable()
      // Notes courantes : elles partent du bilan initial puis bougent à chaque
      // bilan hebdomadaire. L'historique garde la trace de chaque étape.
      table.json('scores').notNullable()
      table.json('scores_history').notNullable()
      table.integer('overall_score').notNullable()
      table.string('level', 20).notNullable()

      table.integer('cycle').notNullable().defaultTo(1)
      table.integer('current_week').notNullable().defaultTo(1)
      table.timestamp('week_started_at').notNullable()
      table.string('status', 20).notNullable().defaultTo('active')
      table.boolean('plan_from_ai').notNullable().defaultTo(false)

      table.timestamp('started_at').notNullable()
      table.timestamp('completed_at').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.now())

      table.index(['user_id', 'status'])
      table.index(['pet_id', 'status'])
    })

    // Une ligne par exercice coché, par jour. L'absence de ligne vaut « pas
    // fait » : rien à créer à l'avance, et l'historique reste exact même si le
    // plan change de cycle.
    this.schema.createTable('training_task_logs', (table) => {
      table.increments('id').primary()
      table
        .integer('program_id')
        .unsigned()
        .references('id')
        .inTable('training_programs')
        .onDelete('CASCADE')
        .notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.date('day').notNullable()
      table.string('task_key', 80).notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())

      table.unique(['program_id', 'day', 'task_key'])
      table.index(['program_id', 'day'])
    })

    this.schema.alterTable('training_assessments', (table) => {
      // 'initial' = les 36 questions, 'weekly' = le point de fin de semaine.
      table.string('kind', 10).notNullable().defaultTo('initial')
      table
        .integer('program_id')
        .unsigned()
        .references('id')
        .inTable('training_programs')
        .onDelete('CASCADE')
        .nullable()
      table.integer('week').nullable()
      table.integer('cycle').nullable()
    })
  }

  async down() {
    this.schema.alterTable('training_assessments', (table) => {
      table.dropColumn('kind')
      table.dropColumn('program_id')
      table.dropColumn('week')
      table.dropColumn('cycle')
    })
    this.schema.dropTable('training_task_logs')
    this.schema.dropTable('training_programs')
  }
}
