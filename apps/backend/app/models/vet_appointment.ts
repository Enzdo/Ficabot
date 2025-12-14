import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Pet from '#models/pet'

export default class VetAppointment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare petId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare vetName: string | null

  @column()
  declare vetAddress: string | null

  @column()
  declare vetPhone: string | null

  @column()
  declare appointmentDate: string

  @column()
  declare appointmentTime: string | null

  @column()
  declare status: 'scheduled' | 'completed' | 'cancelled'

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>
}
