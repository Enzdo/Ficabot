import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Qui voit les fonctions encore en essai.
 *
 * Stock, facturation, comptabilité et statistiques ne sont pas prêtes à être
 * montrées à tous les comptes d'essai. Plutôt qu'une liste d'adresses en dur
 * dans le logiciel, un indicateur par cabinet : il s'ouvre et se referme sans
 * redéployer, et le jour où ces écrans sortent, il suffit de le passer à vrai
 * pour tout le monde puis de le retirer.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('veterinarians', (table) => {
      table.boolean('beta_features').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable('veterinarians', (table) => {
      table.dropColumn('beta_features')
    })
  }
}
