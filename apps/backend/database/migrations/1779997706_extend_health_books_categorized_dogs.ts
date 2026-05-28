import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'health_books'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Catégorie 1 (chiens d'attaque) ou 2 (chiens de garde et défense)
      // Stocké en clair (peu sensible, requis pour logique conditionnelle UI)
      table.integer('dog_category').nullable() // 1 | 2 | null

      // Permis de détention délivré par la mairie (encrypted)
      table.text('detention_permit_number').nullable()
      table.string('detention_permit_issued_at').nullable()
      table.text('detention_permit_city').nullable()

      // Attestation d'aptitude CETAC (encrypted)
      table.text('aptitude_certificate_number').nullable()
      table.string('aptitude_certificate_issued_at').nullable()
      table.text('aptitude_certificate_trainer').nullable()

      // Assurance responsabilité civile (encrypted)
      table.text('liability_insurance_company').nullable()
      table.text('liability_insurance_policy').nullable()
      table.string('liability_insurance_expires_at').nullable()

      // Évaluation comportementale vétérinaire (encrypted)
      table.text('behavioral_assessment_vet').nullable()
      table.string('behavioral_assessment_date').nullable()
      table.integer('behavioral_danger_level').nullable() // 1-4 (échelle vétérinaire)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'dog_category',
        'detention_permit_number',
        'detention_permit_issued_at',
        'detention_permit_city',
        'aptitude_certificate_number',
        'aptitude_certificate_issued_at',
        'aptitude_certificate_trainer',
        'liability_insurance_company',
        'liability_insurance_policy',
        'liability_insurance_expires_at',
        'behavioral_assessment_vet',
        'behavioral_assessment_date',
        'behavioral_danger_level'
      )
    })
  }
}
