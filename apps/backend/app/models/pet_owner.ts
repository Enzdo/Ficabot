import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from './pet.js'
import User from './user.js'

export default class PetOwner extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare userId: number

  @column()
  declare role: 'owner' | 'member'

  @column()
  declare status: 'pending' | 'accepted' | 'rejected'

  @column()
  declare invitedByEmail: string | null

  @column.dateTime()
  declare invitedAt: DateTime | null

  @column.dateTime()
  declare acceptedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
