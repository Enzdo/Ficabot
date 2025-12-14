import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'

export default class SymptomLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare symptom: string

  @column()
  declare severity: 'mild' | 'moderate' | 'severe'

  @column()
  declare description: string | null

  @column()
  declare observedAt: string

  @column()
  declare observedTime: string | null

  @column()
  declare durationMinutes: number | null

  @column()
  declare isResolved: boolean

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>
}
