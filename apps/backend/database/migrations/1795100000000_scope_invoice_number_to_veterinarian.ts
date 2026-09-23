import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Rend le numéro de facture unique par vétérinaire, et non plus globalement.
 *
 * Le numéro est calculé par praticien (`FAC-<année>-<rang>`), mais la colonne
 * portait une contrainte d'unicité globale : la première facture de l'année du
 * deuxième vétérinaire s'appelait `FAC-2026-001`, déjà pris, et l'insertion
 * partait en violation de contrainte.
 *
 * Aucun risque de doublon à la reprise : l'ancienne contrainte garantissait
 * déjà l'unicité globale, donc a fortiori l'unicité par praticien.
 */
export default class extends BaseSchema {
  protected tableName = 'vet_invoices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['number'])
      table.unique(['veterinarian_id', 'number'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['veterinarian_id', 'number'])
      table.unique(['number'])
    })
  }
}
