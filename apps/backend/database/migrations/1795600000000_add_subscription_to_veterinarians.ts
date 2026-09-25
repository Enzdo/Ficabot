import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Abonnement au logiciel, côté praticien.
 *
 * Rien n'existait : le modèle vétérinaire ne portait aucune notion d'offre ni
 * d'échéance. Les seuls champs d'abonnement du projet sont sur `users`, et ils
 * concernent le premium des propriétaires — un autre produit, une autre grille.
 *
 * `subscription_status` reprend le vocabulaire de Stripe plutôt qu'un booléen :
 * un abonnement impayé n'est ni actif ni résilié, et la nuance décide de ce
 * qu'on affiche au praticien.
 */
export default class extends BaseSchema {
  protected tableName = 'veterinarians'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // 'liberal' | 'clinique' — 'reseau' est sur mesure, donc hors paiement.
      table.string('plan').nullable()
      table.string('subscription_status').nullable()
      table.string('stripe_customer_id').nullable()
      table.string('stripe_subscription_id').nullable()
      table.timestamp('subscription_ends_at').nullable()
      table.index(['stripe_customer_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('plan')
      table.dropColumn('subscription_status')
      table.dropColumn('stripe_customer_id')
      table.dropColumn('stripe_subscription_id')
      table.dropColumn('subscription_ends_at')
    })
  }
}
