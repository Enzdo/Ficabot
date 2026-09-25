import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Dispense d'abonnement.
 *
 * Le péage s'applique à partir de maintenant. Les comptes qui existaient avant
 * lui ne doivent pas se retrouver enfermés dehors du jour au lendemain : ils
 * sont dispensés, et le resteront tant qu'on ne les basculera pas à la main.
 *
 * Un indicateur explicite plutôt qu'une comparaison de dates : on doit pouvoir
 * dispenser un compte au cas par cas — un confrère en essai, une démonstration,
 * un dépannage — sans toucher au code.
 */
export default class extends BaseSchema {
  protected tableName = 'veterinarians'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('subscription_exempt').notNullable().defaultTo(false)
    })

    this.defer(async (db) => {
      await db.from(this.tableName).update({ subscription_exempt: true })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('subscription_exempt')
    })
  }
}
