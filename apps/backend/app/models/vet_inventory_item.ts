import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'
import VetInventoryMovement from '#models/vet_inventory_movement'

export default class VetInventoryItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare name: string

  @column()
  declare category: string

  @column()
  declare sku: string | null

  @column()
  declare quantity: number

  @column()
  declare unit: string

  @column()
  declare minStock: number

  @column()
  declare price: number

  @column()
  declare supplier: string | null

  @column()
  declare expiryDate: string | null

  @column()
  declare notes: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>

  @hasMany(() => VetInventoryMovement, { foreignKey: 'itemId' })
  declare movements: HasMany<typeof VetInventoryMovement>
}
