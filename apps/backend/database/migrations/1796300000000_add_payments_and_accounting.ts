import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * De quoi nourrir un comptable.
 *
 * Trois manques se tenaient : le règlement était binaire — payée ou non —, les
 * numéros de comptes n'existaient nulle part, et rien ne figeait un mois une
 * fois transmis.
 */
export default class extends BaseSchema {
  async up() {
    /**
     * Registre des règlements.
     *
     * Le statut d'une facture ne disait que « payée » ou « en attente », à une
     * date d'encaissement unique. Un client réglant en deux fois n'était pas
     * représentable, et la date d'encaissement — celle qui compte en trésorerie
     * — se confondait avec celle de la facture.
     *
     * Le moyen de paiement n'est pas décoratif : il décide du journal
     * comptable, banque ou caisse.
     */
    this.schema.createTable('vet_payments', (table) => {
      table.increments('id')
      table
        .integer('invoice_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('vet_invoices')
        .onDelete('CASCADE')
      table
        .integer('veterinarian_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')

      table.date('date').notNullable()
      table.decimal('amount', 12, 2).notNullable()
      /** 'cash' | 'card' | 'check' | 'transfer' | 'other' */
      table.string('method').notNullable().defaultTo('card')
      table.string('reference').nullable()
      table.string('note').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['veterinarian_id', 'date'], 'vet_payments_vet_date_index')
      table.index(['invoice_id'], 'vet_payments_invoice_index')
    })

    /**
     * Reprise des encaissements déjà enregistrés sous forme de statut, pour que
     * le registre ne démarre pas en contredisant l'historique.
     */
    this.defer(async (db) => {
      await db.rawQuery(`
        INSERT INTO vet_payments (invoice_id, veterinarian_id, date, amount, method, note, created_at, updated_at)
        SELECT i.id, i.veterinarian_id, COALESCE(i.paid_at::date, i.date), i.total, 'other',
               'Repris du statut « payée » lors de la mise en place du registre', now(), now()
        FROM vet_invoices AS i
        WHERE i.status = 'paid' AND i.type = 'invoice'
      `)
    })

    this.schema.alterTable('veterinarians', (table) => {
      /**
       * Plan de comptes. Chaque cabinet a un comptable avec ses habitudes :
       * figer ces numéros dans le code garantirait de tout refaire.
       */
      table.string('account_sales').notNullable().defaultTo('706000')
      table.string('account_goods').notNullable().defaultTo('707000')
      table.string('account_vat').notNullable().defaultTo('445710')
      table.string('account_clients').notNullable().defaultTo('411000')
      table.string('account_bank').notNullable().defaultTo('512000')
      table.string('account_cash').notNullable().defaultTo('530000')

      /**
       * Dernier mois clôturé, au format AAAA-MM. Les écritures antérieures ne
       * bougent plus : c'est ce qui rend un export transmis au comptable
       * fiable, et ce que suppose l'inaltérabilité.
       */
      table.string('accounting_closed_through').nullable()
    })
  }

  async down() {
    this.schema.alterTable('veterinarians', (table) => {
      table.dropColumn('accounting_closed_through')
      table.dropColumn('account_cash')
      table.dropColumn('account_bank')
      table.dropColumn('account_clients')
      table.dropColumn('account_vat')
      table.dropColumn('account_goods')
      table.dropColumn('account_sales')
    })
    this.schema.dropTableIfExists('vet_payments')
  }
}
