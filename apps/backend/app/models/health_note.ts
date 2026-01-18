import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'

export default class HealthNote extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare petId: number

    @column()
    declare type: 'symptom' | 'observation' | 'medication' | 'general'

    @column()
    declare content: string

    @column.date()
    declare date: DateTime

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => Pet)
    declare pet: BelongsTo<typeof Pet>
}
