import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'

export default class VetAttachment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare petId: number | null

  @column()
  declare petName: string | null

  @column()
  declare category: string

  @column()
  declare fileName: string

  @column()
  declare filePath: string

  @column()
  declare fileType: string

  @column()
  declare fileSize: number

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>
}
