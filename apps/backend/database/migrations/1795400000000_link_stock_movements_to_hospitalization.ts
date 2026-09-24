import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Relie une sortie de stock au séjour de l'animal qui l'a consommée.
 *
 * La raison « Utilisation patient » n'était qu'une chaîne de caractères :
 * rien ne disait pour quel animal, et rien ne remontait à la facturation. Un
 * médicament administré pendant une hospitalisation sortait du stock et
 * disparaissait — il fallait se souvenir de le refacturer à la main.
 *
 * `billed` évite le double comptage : une consommation reprise sur une facture
 * ne doit plus être proposée sur la suivante.
 */
export default class extends BaseSchema {
  protected tableName = 'vet_inventory_movements'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('hospitalization_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('vet_hospitalizations')
        // La consommation reste au stock même si le séjour est effacé : c'est
        // un mouvement comptable, il ne doit pas disparaître avec le dossier.
        .onDelete('SET NULL')
      table.boolean('billed').notNullable().defaultTo(false)
      table.index(['hospitalization_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('hospitalization_id')
      table.dropColumn('billed')
    })
  }
}
