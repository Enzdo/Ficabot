import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UserNotification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: 'vet_response' | 'pre_diagnosis_completed' | 'appointment_reminder' | 'general'

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare relatedEntityType: string | null

  @column()
  declare relatedEntityId: number | null

  @column()
  declare isRead: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
