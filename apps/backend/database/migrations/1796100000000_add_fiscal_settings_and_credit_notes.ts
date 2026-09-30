import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Met la facturation en conformité.
 *
 * Trois manques se tenaient : la TVA était figée à 20 % dans le code, la
 * facture imprimée ne portait aucune mention légale, et une facture émise ne
 * pouvait être annulée que par suppression — ce qui laisse un trou dans la
 * séquence, précisément ce qu'un contrôle regarde.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('veterinarians', (table) => {
      /**
       * Taux de TVA du cabinet. Paramétrable : 20 % est la règle pour les actes
       * vétérinaires, mais un praticien en franchise en base facture sans TVA,
       * et certains produits relèvent d'un taux réduit.
       */
      table.decimal('vat_rate', 5, 2).nullable().defaultTo(20)

      /**
       * Franchise en base de TVA. La facture doit alors porter la mention de
       * l'article 293 B du CGI et ne comporter aucune TVA — la facturer serait
       * une erreur, pas une approximation.
       */
      table.boolean('vat_exempt').notNullable().defaultTo(false)

      /** Numéro de TVA intracommunautaire, mention obligatoire quand il existe. */
      table.string('vat_number').nullable()

      /** Délai de paiement annoncé sur la facture, en jours. */
      table.integer('payment_terms_days').notNullable().defaultTo(30)
    })

    this.schema.alterTable('vet_invoices', (table) => {
      /**
       * Une pièce comptable est soit une facture, soit un avoir. L'avoir est la
       * seule façon correcte d'annuler ou de corriger une facture émise.
       */
      table.string('type').notNullable().defaultTo('invoice')

      /** Facture que cet avoir annule. Nul sur une facture. */
      table
        .integer('cancels_invoice_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('vet_invoices')
        .onDelete('SET NULL')

      /** Motif de l'avoir, porté sur le document remis au client. */
      table.string('credit_reason').nullable()
    })
  }

  async down() {
    this.schema.alterTable('vet_invoices', (table) => {
      table.dropColumn('credit_reason')
      table.dropColumn('cancels_invoice_id')
      table.dropColumn('type')
    })

    this.schema.alterTable('veterinarians', (table) => {
      table.dropColumn('payment_terms_days')
      table.dropColumn('vat_number')
      table.dropColumn('vat_exempt')
      table.dropColumn('vat_rate')
    })
  }
}
