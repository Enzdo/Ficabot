import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type Pet from '#models/pet'

export default class MedicalRecord extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare type: 'vaccine' | 'treatment' | 'visit'

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.date()
  declare date: DateTime

  @column.date()
  declare nextDueDate: DateTime | null

  @column()
  declare vetName: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => import('#models/pet'))
  declare pet: BelongsTo<typeof Pet>
}
