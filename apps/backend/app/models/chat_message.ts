import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Pet from '#models/pet'

export default class ChatMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare petId: number | null

  @column()
  declare role: 'user' | 'assistant'

  @column()
  declare message: string

  @column()
  declare conversationId: string | null

  @column()
  declare conversationTitle: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => import('#models/user'))
  declare user: BelongsTo<typeof User>

  @belongsTo(() => import('#models/pet'))
  declare pet: BelongsTo<typeof Pet>
}
