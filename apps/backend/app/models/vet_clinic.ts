import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'

export default class VetClinic extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare placeId: string

  @column()
  declare name: string

  @column()
  declare address: string

  @column()
  declare latitude: number

  @column()
  declare longitude: number

  @column()
  declare phone: string | null

  @column()
  declare website: string | null

  @column()
  declare rating: number | null

  @column()
  declare userRatingsTotal: number | null

  @column()
  declare openingHours: object | null

  @column()
  declare photoReference: string | null

  @column()
  declare isVerified: boolean

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Veterinarian)
  declare veterinarians: HasMany<typeof Veterinarian>
}
