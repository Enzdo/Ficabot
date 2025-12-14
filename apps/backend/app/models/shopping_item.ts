import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from './pet.js'
import User from './user.js'

export default class ShoppingItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare petId: number | null

  @column()
  declare name: string

  @column()
  declare category: 'food' | 'treats' | 'toys' | 'accessories' | 'hygiene' | 'health' | 'other'

  @column()
  declare quantity: number

  @column()
  declare unit: string | null

  @column()
  declare isCompleted: boolean

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
