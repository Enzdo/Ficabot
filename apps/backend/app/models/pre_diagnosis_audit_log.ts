import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PreDiagnosis from '#models/pre_diagnosis'
import User from '#models/user'
import Veterinarian from '#models/veterinarian'

export default class PreDiagnosisAuditLog extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare preDiagnosisId: number

    @column()
    declare userId: number

    @column()
    declare veterinarianId: number | null

    @column()
    declare action: 'created' | 'ai_analyzed' | 'synthesized' | 'viewed' | 'shared' | 'downloaded'

    @column()
    declare ipAddress: string

    @column()
    declare userAgent: string

    @column()
    declare disclaimerAccepted: boolean

    @column({
        prepare: (value: object | null) => value ? JSON.stringify(value) : null,
        consume: (value: string | null) => value ? JSON.parse(value) : null,
    })
    declare metadata: object | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // Relationships
    @belongsTo(() => PreDiagnosis)
    declare preDiagnosis: BelongsTo<typeof PreDiagnosis>

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    @belongsTo(() => Veterinarian)
    declare veterinarian: BelongsTo<typeof Veterinarian>
}
