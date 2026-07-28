import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Localisation de l'utilisateur, saisie pendant l'onboarding.
 * Sert à afficher des conseils adaptés à la météo du jour.
 * Les coordonnées sont conservées pour éviter un géocodage à chaque requête.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('city').nullable()
      table.decimal('latitude', 9, 6).nullable()
      table.decimal('longitude', 9, 6).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('city')
      table.dropColumn('latitude')
      table.dropColumn('longitude')
    })
  }
}
