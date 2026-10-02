import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import VetInvoice from '#models/vet_invoice'

export default class VetInvoiceItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare invoiceId: number

  @column()
  declare description: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare total: number

  /**
   * Taux de TVA de la ligne, figé à l'émission.
   *
   * Il ne se recalcule jamais : un changement de taux, au catalogue ou dans la
   * loi, ne doit pas réécrire une facture déjà remise au client.
   */
  @column()
  declare taxRate: number | null

  @column()
  declare tax: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => VetInvoice, { foreignKey: 'invoiceId' })
  declare invoice: BelongsTo<typeof VetInvoice>
}
