import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_task_logs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ce que le propriétaire a observé pendant l'exercice. C'est la matière
      // que le modèle relit en fin de cycle : « il tire encore quand il voit un
      // chien » vaut mieux qu'une case cochée pour ajuster la suite.
      table.text('note').nullable()

      // Jusqu'ici, l'existence de la ligne valait « fait ». Une note doit
      // pouvoir exister sur un exercice non fait — « pas eu le temps, il était
      // trop excité » est une information utile — d'où ce drapeau explicite.
      // Les lignes déjà en base sont toutes des exercices faits.
      table.boolean('done').notNullable().defaultTo(true)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('note')
      table.dropColumn('done')
    })
  }
}
