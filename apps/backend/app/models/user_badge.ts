import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Badge from './badge.js'
import Pet from './pet.js'

export default class UserBadge extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare badgeId: number

  @column()
  declare petId: number | null

  @column.dateTime()
  declare earnedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Badge)
  declare badge: BelongsTo<typeof Badge>

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>
}
