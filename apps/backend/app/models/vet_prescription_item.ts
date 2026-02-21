import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import VetPrescription from '#models/vet_prescription'

export default class VetPrescriptionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare prescriptionId: number

  @column()
  declare medicationName: string

  @column()
  declare dosage: string

  @column()
  declare frequency: string

  @column()
  declare duration: string

  @column()
  declare instructions: string | null

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => VetPrescription, { foreignKey: 'prescriptionId' })
  declare prescription: BelongsTo<typeof VetPrescription>
}
