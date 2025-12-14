import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Pet from '#models/pet'

export default class Reminder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare petId: number

  @column()
  declare type: 'vaccine' | 'antiparasitic' | 'weighing' | 'appointment' | 'custom'

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare dueDate: string

  @column()
  declare dueTime: string | null

  @column()
  declare isCompleted: boolean

  @column()
  declare isRecurring: boolean

  @column()
  declare recurrenceInterval: 'daily' | 'weekly' | 'monthly' | 'yearly' | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>
}
