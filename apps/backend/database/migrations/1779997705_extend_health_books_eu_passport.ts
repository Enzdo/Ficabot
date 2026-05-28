import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'health_books'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Vétérinaire poseur de puce (encrypted)
      table.text('chip_vet_name').nullable()
      table.text('chip_vet_order_number').nullable()

      // Vétérinaire émetteur du passeport (encrypted)
      table.text('passport_vet_name').nullable()
      table.text('passport_vet_order_number').nullable()
      table.text('passport_vet_stamp').nullable()

      // Traitement échinocoque (encrypted) — obligatoire pour FI/IE/NO/MT
      table.text('echinococcus_treatments').nullable() // JSON array: [{date, product, vet}]

      // Signalement détaillé (encrypted)
      table.text('coat_color').nullable()
      table.text('coat_pattern').nullable() // robe / motif
      table.text('distinctive_marks').nullable()

      // Sexe (encrypted) — requis passeport EU
      table.text('sex').nullable() // 'male' | 'female'
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'chip_vet_name',
        'chip_vet_order_number',
        'passport_vet_name',
        'passport_vet_order_number',
        'passport_vet_stamp',
        'echinococcus_treatments',
        'coat_color',
        'coat_pattern',
        'distinctive_marks',
        'sex'
      )
    })
  }
}
