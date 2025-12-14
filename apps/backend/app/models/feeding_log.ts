import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'

export default class FeedingLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare foodType: 'dry' | 'wet' | 'raw' | 'homemade' | 'treats'

  @column()
  declare brand: string | null

  @column()
  declare productName: string | null

  @column()
  declare quantity: number | null

  @column()
  declare unit: 'g' | 'kg' | 'ml' | 'cups'

  @column()
  declare fedAt: string

  @column()
  declare fedTime: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>
}
