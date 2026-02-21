import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'

export default class VetReminder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare petId: number | null

  @column()
  declare userId: number | null

  @column()
  declare petName: string | null

  @column()
  declare clientName: string | null

  @column()
  declare type: 'vaccine' | 'deworming' | 'treatment' | 'checkup' | 'other'

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare dueDate: string

  @column()
  declare status: 'pending' | 'sent' | 'completed' | 'cancelled'

  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>
}
