import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import MedicalRecord from '#models/medical_record'
import ChatMessage from '#models/chat_message'

export default class Pet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare species: 'dog' | 'cat'

  @column()
  declare breed: string | null

  @column.date()
  declare birthDate: DateTime | null

  @column()
  declare weight: number | null

  @column()
  declare avatarUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => MedicalRecord)
  declare medicalRecords: HasMany<typeof MedicalRecord>

  @hasMany(() => ChatMessage)
  declare chatMessages: HasMany<typeof ChatMessage>
}
