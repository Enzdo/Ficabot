import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * La composition du tableau de bord, propre à chaque praticien.
 *
 * Un vétérinaire rural, une clinique de ville et une structure à plusieurs
 * praticiens ne regardent pas les mêmes chiffres le matin. Plutôt qu'un écran
 * unique qui conviendrait à peu près à tout le monde, chacun compose le sien.
 *
 * `null` signifie « jamais touché » : l'écran retombe alors sur la disposition
 * par défaut, qui peut évoluer avec le logiciel. Une liste vide, elle, est un
 * choix — celui d'un tableau de bord nu.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('veterinarians', (table) => {
      table.jsonb('dashboard_layout').nullable()
    })
  }

  async down() {
    this.schema.alterTable('veterinarians', (table) => {
      table.dropColumn('dashboard_layout')
    })
  }
}
