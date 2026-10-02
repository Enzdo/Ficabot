import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Rattache les factures à un client.
 *
 * Une facture ne portait que `client_name` et `client_email`, en texte libre.
 * On ne pouvait donc pas tenir un compte client : savoir ce qu'une personne
 * doit au total, retrouver ses factures, ni produire le compte auxiliaire
 * qu'exige la comptabilité. Deux clients homonymes étaient indiscernables, et
 * une faute de frappe créait un client fantôme.
 *
 * Comme pour les patients, le client est de deux natures : un propriétaire
 * inscrit, ou une fiche saisie par le cabinet. Les deux colonnes restent
 * facultatives — une facture au comptant pour un passage unique n'a pas besoin
 * d'un client au fichier, et les factures déjà émises n'en ont pas.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('vet_invoices', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table
        .integer('external_client_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('vet_external_clients')
        .onDelete('SET NULL')

      table.index(['user_id'], 'vet_invoices_user_id_index')
      table.index(['external_client_id'], 'vet_invoices_external_client_id_index')
    })

    /**
     * Rattachement des factures existantes, par correspondance d'adresse.
     *
     * Seul l'e-mail sert de clé : un rapprochement sur le nom produirait des
     * faux positifs, et rattacher une facture au mauvais client est pire que
     * de la laisser non rattachée.
     */
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE vet_invoices AS i
        SET external_client_id = c.id
        FROM vet_external_clients AS c
        WHERE i.external_client_id IS NULL
          AND i.user_id IS NULL
          AND i.client_email IS NOT NULL
          AND c.email IS NOT NULL
          AND lower(i.client_email) = lower(c.email)
          AND c.veterinarian_id = i.veterinarian_id
      `)

      await db.rawQuery(`
        UPDATE vet_invoices AS i
        SET user_id = u.id
        FROM users AS u
        WHERE i.external_client_id IS NULL
          AND i.user_id IS NULL
          AND i.client_email IS NOT NULL
          AND lower(i.client_email) = lower(u.email)
      `)
    })
  }

  async down() {
    this.schema.alterTable('vet_invoices', (table) => {
      table.dropIndex(['external_client_id'], 'vet_invoices_external_client_id_index')
      table.dropIndex(['user_id'], 'vet_invoices_user_id_index')
      table.dropColumn('external_client_id')
      table.dropColumn('user_id')
    })
  }
}
