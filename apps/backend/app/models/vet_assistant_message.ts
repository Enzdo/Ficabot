import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class VetAssistantMessage extends BaseModel {
  public static table = 'vet_assistant_messages'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conversationId: number

  @column()
  declare role: 'user' | 'assistant'

  @column()
  declare content: string

  /** Sources citées, sérialisées en JSON */
  @column()
  declare sources: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
