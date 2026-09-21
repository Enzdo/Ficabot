import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import VetAssistantMessage from '#models/vet_assistant_message'

export default class VetAssistantConversation extends BaseModel {
  public static table = 'vet_assistant_conversations'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare petId: number | null

  @column()
  declare title: string

  @column.dateTime()
  declare lastMessageAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => VetAssistantMessage, { foreignKey: 'conversationId' })
  declare messages: HasMany<typeof VetAssistantMessage>

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>
}
