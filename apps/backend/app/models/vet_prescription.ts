import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import VetPrescriptionItem from '#models/vet_prescription_item'
import Veterinarian from '#models/veterinarian'

export default class VetPrescription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare petId: number | null

  @column()
  declare userId: number | null

  @column()
  declare appointmentId: number | null

  @column()
  declare date: string

  @column()
  declare petName: string | null

  @column()
  declare clientName: string | null

  @column()
  declare diagnosis: string | null

  @column()
  declare notes: string | null

  @column()
  declare status: 'active' | 'completed' | 'cancelled'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => VetPrescriptionItem, { foreignKey: 'prescriptionId' })
  declare items: HasMany<typeof VetPrescriptionItem>

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>
}
