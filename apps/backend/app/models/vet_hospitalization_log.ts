import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import VetHospitalization from '#models/vet_hospitalization'

export default class VetHospitalizationLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare hospitalizationId: number

  @column()
  declare type: 'note' | 'medication' | 'feeding' | 'vitals' | 'observation'

  @column()
  declare content: string

  @column()
  declare data: any | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => VetHospitalization, { foreignKey: 'hospitalizationId' })
  declare hospitalization: BelongsTo<typeof VetHospitalization>
}
