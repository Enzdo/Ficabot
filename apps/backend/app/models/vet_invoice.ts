import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import VetInvoiceItem from '#models/vet_invoice_item'
import Veterinarian from '#models/veterinarian'

export default class VetInvoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare number: string

  @column()
  declare clientName: string

  @column()
  declare clientEmail: string | null

  @column()
  declare petName: string | null

  @column()
  declare date: string

  @column()
  declare dueDate: string

  @column()
  declare subtotal: number

  @column()
  declare taxRate: number

  @column()
  declare tax: number

  @column()
  declare total: number

  @column()
  declare status: 'draft' | 'pending' | 'paid' | 'overdue'

  @column()
  declare notes: string | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => VetInvoiceItem, { foreignKey: 'invoiceId' })
  declare items: HasMany<typeof VetInvoiceItem>

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>
}
