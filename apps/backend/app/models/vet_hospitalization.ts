import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'
import VetHospitalizationLog from '#models/vet_hospitalization_log'

export default class VetHospitalization extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare petId: number | null

  @column()
  declare petName: string

  @column()
  declare petSpecies: string | null

  @column()
  declare clientName: string

  @column()
  declare clientPhone: string | null

  @column()
  declare admissionDate: string

  @column()
  declare expectedDischarge: string | null

  @column()
  declare actualDischarge: string | null

  @column()
  declare reason: string

  @column()
  declare diagnosis: string | null

  @column()
  declare treatmentPlan: string | null

  @column()
  declare status: 'active' | 'discharged' | 'deceased'

  @column()
  declare cageNumber: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>

  @hasMany(() => VetHospitalizationLog, { foreignKey: 'hospitalizationId' })
  declare logs: HasMany<typeof VetHospitalizationLog>
}
