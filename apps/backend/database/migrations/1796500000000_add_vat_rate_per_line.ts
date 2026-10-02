import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * La TVA par ligne, et non plus par facture.
 *
 * Un cabinet applique plusieurs taux : l'acte et le médicament ne relèvent pas
 * forcément du même, et une facture qui mêle les deux sous un taux unique est
 * fausse — avec elle, la déclaration. Le taux descend donc à la ligne, et se
 * renseigne au catalogue pour n'avoir pas à le choisir à chaque saisie.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('vet_invoice_items', (table) => {
      // Nullable à dessein : les lignes déjà écrites sont reprises juste après,
      // et une valeur par défaut masquerait celles que la reprise aurait ratées.
      table.decimal('tax_rate', 5, 2).nullable()
      table.decimal('tax', 12, 2).nullable()
    })

    this.schema.alterTable('vet_services', (table) => {
      table.decimal('vat_rate', 5, 2).nullable()
    })

    this.schema.alterTable('vet_inventory_items', (table) => {
      table.decimal('vat_rate', 5, 2).nullable()
    })

    this.defer(async (db) => {
      /**
       * Les lignes existantes héritent du taux de leur facture.
       *
       * C'est exact : jusqu'ici toutes les lignes d'une facture partageaient
       * forcément son taux, puisqu'il n'y en avait qu'un. La reprise ne
       * suppose donc rien, elle explicite ce qui était déjà vrai.
       */
      await db.rawQuery(`
        UPDATE vet_invoice_items AS li
        SET tax_rate = f.tax_rate,
            tax = ROUND(li.total * COALESCE(f.tax_rate, 0) / 100, 2)
        FROM vet_invoices AS f
        WHERE li.invoice_id = f.id
          AND li.tax_rate IS NULL
      `)
    })

    /**
     * `vet_invoices.tax_rate` devient facultatif.
     *
     * Dès qu'une facture mêle deux taux, aucun chiffre unique ne la décrit :
     * la colonne vaut alors NULL, et la ventilation se lit sur les lignes. Elle
     * reste renseignée quand un seul taux s'applique — le cas courant —, ce qui
     * laisse les factures anciennes et l'affichage inchangés.
     */
    this.schema.alterTable('vet_invoices', (table) => {
      table.decimal('tax_rate', 5, 2).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable('vet_invoice_items', (table) => {
      table.dropColumn('tax_rate')
      table.dropColumn('tax')
    })
    this.schema.alterTable('vet_services', (table) => {
      table.dropColumn('vat_rate')
    })
    this.schema.alterTable('vet_inventory_items', (table) => {
      table.dropColumn('vat_rate')
    })
  }
}
