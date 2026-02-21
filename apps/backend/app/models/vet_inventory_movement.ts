import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import VetInventoryItem from '#models/vet_inventory_item'

export default class VetInventoryMovement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare itemId: number

  @column()
  declare type: 'in' | 'out' | 'adjustment'

  @column()
  declare quantity: number

  @column()
  declare reason: string | null

  @column()
  declare reference: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => VetInventoryItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof VetInventoryItem>
}
