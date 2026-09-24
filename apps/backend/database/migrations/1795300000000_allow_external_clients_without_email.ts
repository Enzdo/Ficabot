import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Rend l'adresse facultative pour un client externe.
 *
 * La seule façon de créer un client était de l'inviter, ce qui exigeait une
 * adresse et déclenchait un envoi. Un client de passage — qui laisse un nom et
 * un téléphone au comptoir — n'avait donc pas sa place dans le logiciel.
 *
 * L'unicité (vétérinaire, email) est conservée : Postgres tolère plusieurs
 * valeurs nulles dans une contrainte unique, plusieurs clients sans adresse ne
 * se gênent donc pas.
 */
export default class extends BaseSchema {
  protected tableName = 'vet_external_clients'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email').notNullable().alter()
    })
  }
}
