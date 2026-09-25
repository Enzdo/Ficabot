import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Lie un utilisateur à son client Stripe.
 *
 * `premium_provider` et `premium_subscription_id` existaient déjà — le modèle
 * anticipait un fournisseur de paiement. Manquait l'identifiant du client
 * Stripe : sans lui, un abonné qui renouvelle créerait un second client, et
 * l'historique de facturation se scinderait en deux.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('stripe_customer_id').nullable()
      table.index(['stripe_customer_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stripe_customer_id')
    })
  }
}
