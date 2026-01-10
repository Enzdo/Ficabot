import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PreDiagnosis from '#models/pre_diagnosis'

export default class SynthesisResult extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare preDiagnosisId: number

    @column({
        prepare: (value: any[]) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value),
    })
    declare prioritizedHypotheses: any[]

    @column({
        prepare: (value: any[]) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value),
    })
    declare urgentSigns: any[]

    @column({
        prepare: (value: string[]) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value),
    })
    declare generalRecommendations: string[]

    @column()
    declare userFriendlySummary: string

    @column()
    declare disclaimer: string

    @column()
    declare overallUrgency: 'low' | 'medium' | 'high' | 'critical'

    @column.dateTime()
    declare synthesizedAt: DateTime

    // Relationships
    @belongsTo(() => PreDiagnosis)
    declare preDiagnosis: BelongsTo<typeof PreDiagnosis>
}
