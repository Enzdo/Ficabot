import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Bibliothèque de modèles de compte rendu.
 *
 * Jusqu'ici les trois modèles étaient codés en dur dans le service. Ils
 * deviennent des données : la clinique peut créer les siens, et chaque
 * praticien marque ses favoris.
 *
 * `veterinarian_id` nul = modèle général, fourni avec le produit et visible
 * par tous. Renseigné = modèle personnel, visible de son seul auteur.
 */
export default class extends BaseSchema {
  protected tableName = 'report_templates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('veterinarian_id')
        .unsigned()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')
        .nullable()
      // Identifiant stable pour les modèles fournis (generale, dermatologie…)
      table.string('slug').nullable()
      table.string('name').notNullable()
      table.string('category').nullable() // general, dermatologie, equin, chirurgie…
      table.text('description').nullable()
      // Rubriques : [{ key, label, hint }]
      table.text('sections').notNullable()
      table.boolean('is_builtin').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['veterinarian_id'])
      table.unique(['slug'])
    })

    this.schema.createTable('report_template_favorites', (table) => {
      table.increments('id')
      table
        .integer('veterinarian_id')
        .unsigned()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('template_id')
        .unsigned()
        .references('id')
        .inTable(this.tableName)
        .onDelete('CASCADE')
        .notNullable()
      table.timestamp('created_at')

      table.unique(['veterinarian_id', 'template_id'])
    })
  }

  async down() {
    this.schema.dropTable('report_template_favorites')
    this.schema.dropTable(this.tableName)
  }
}
