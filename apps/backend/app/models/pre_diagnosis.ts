import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import User from '#models/user'
import Veterinarian from '#models/veterinarian'
import AIResponse from '#models/ai_response'
import SynthesisResult from '#models/synthesis_result'
import PreDiagnosisAuditLog from '#models/pre_diagnosis_audit_log'

export default class PreDiagnosis extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare petId: number

    @column()
    declare userId: number

    @column()
    declare veterinarianId: number | null

    @column()
    declare species: 'dog' | 'cat'

    @column()
    declare userDescription: string

    @column({
        prepare: (value: string[]) => JSON.stringify(value),
    })
    declare imageUrls: string[]

    @column()
    declare status: 'pending' | 'processing' | 'completed' | 'failed'

    @column()
    declare urgencyLevel: 'low' | 'medium' | 'high' | 'critical' | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime()
    declare completedAt: DateTime | null

    @column.dateTime()
    declare veterinarianNotifiedAt: DateTime | null

    @column.dateTime()
    declare veterinarianViewedAt: DateTime | null

    @column()
    declare veterinarianResponse: string | null

    @column.dateTime()
    declare veterinarianResponseAt: DateTime | null

    @column()
    declare priority: 'low' | 'medium' | 'high' | 'urgent'

    // Relationships
    @belongsTo(() => Pet)
    declare pet: BelongsTo<typeof Pet>

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    @belongsTo(() => Veterinarian)
    declare veterinarian: BelongsTo<typeof Veterinarian>

    @hasMany(() => AIResponse)
    declare aiResponses: HasMany<typeof AIResponse>

    @hasOne(() => SynthesisResult)
    declare synthesisResult: HasOne<typeof SynthesisResult>

    @hasMany(() => PreDiagnosisAuditLog)
    declare auditLogs: HasMany<typeof PreDiagnosisAuditLog>
}
