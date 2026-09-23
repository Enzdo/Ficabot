import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Coordonnées du cabinet, portées par le vétérinaire.
 *
 * L'onglet « Clinique » des réglages proposait SIRET, code postal, ville, site
 * web et horaires d'ouverture, et n'en persistait presque rien : les écritures
 * étaient enfermées dans un `if (vet.clinic)`, or `clinic_id` n'est renseigné
 * qu'à l'inscription et le formulaire d'inscription ne collecte aucune donnée de
 * clinique — la relation est donc nulle pour tout compte créé par l'application.
 * Le serveur répondait malgré tout « enregistré ».
 *
 * `vet_clinics` ne pouvait pas accueillir ces valeurs : c'est un miroir de
 * Google Places (`place_id`, latitude et longitude obligatoires), et y créer des
 * lignes de synthèse aurait pollué la recherche de cliniques. Ces champs
 * rejoignent donc `clinic_name`, `address` et `phone`, déjà sur le praticien.
 */
export default class extends BaseSchema {
  protected tableName = 'veterinarians'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('siret').nullable()
      table.string('postal_code').nullable()
      table.string('city').nullable()
      table.string('website').nullable()
      table.json('opening_hours').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('siret')
      table.dropColumn('postal_code')
      table.dropColumn('city')
      table.dropColumn('website')
      table.dropColumn('opening_hours')
    })
  }
}
