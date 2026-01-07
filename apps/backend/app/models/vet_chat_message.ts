import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import UserVeterinarian from '#models/user_veterinarian'

export default class VetChatMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userVeterinarianId: number

  @column()
  declare senderType: 'user' | 'vet'

  @column()
  declare senderId: number

  @column()
  declare content: string

  @column()
  declare attachmentUrl: string | null

  @column()
  declare attachmentType: string | null

  @column()
  declare isRead: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => UserVeterinarian)
  declare userVeterinarian: BelongsTo<typeof UserVeterinarian>
}
