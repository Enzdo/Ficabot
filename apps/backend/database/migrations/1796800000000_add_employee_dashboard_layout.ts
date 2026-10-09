import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * La composition du tableau de bord d'un employé.
 *
 * Le jeton de session désigne toujours le cabinet : sans colonne propre, une
 * assistante qui réorganise son écran réécrirait celui du titulaire. Or c'est
 * justement l'inverse qu'on cherche — une secrétaire regarde le planning et les
 * impayés, le praticien ses consultations.
 *
 * Mêmes conventions que `veterinarians.dashboard_layout` : `null` signifie
 * « jamais touché », une liste vide est un choix.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('vet_employees', (table) => {
      table.jsonb('dashboard_layout').nullable()
    })
  }

  async down() {
    this.schema.alterTable('vet_employees', (table) => {
      table.dropColumn('dashboard_layout')
    })
  }
}
