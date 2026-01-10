import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'

export default class VetNotification extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare veterinarianId: number

    @column()
    declare type: 'new_pre_diagnosis' | 'new_client' | 'urgent_case' | 'message'

    @column()
    declare title: string

    @column()
    declare message: string

    @column()
    declare relatedEntityType: string | null

    @column()
    declare relatedEntityId: number | null

    @column()
    declare isRead: boolean

    @column.dateTime()
    declare readAt: DateTime | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // Relationships
    @belongsTo(() => Veterinarian)
    declare veterinarian: BelongsTo<typeof Veterinarian>
}
