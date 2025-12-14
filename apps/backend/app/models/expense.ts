import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from './pet.js'
import User from './user.js'

export default class Expense extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare userId: number

  @column()
  declare category: 'vet' | 'food' | 'accessories' | 'grooming' | 'insurance' | 'other'

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare amount: number

  @column.date()
  declare expenseDate: DateTime

  @column()
  declare receiptUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
