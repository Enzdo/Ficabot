import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PreDiagnosis from '#models/pre_diagnosis'

export default class AIResponse extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare preDiagnosisId: number

    @column()
    declare model: 'claude' | 'gpt' | 'gemini'

    @column({
        prepare: (value: object) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value),
    })
    declare rawResponse: object

    @column({
        prepare: (value: any[]) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value),
    })
    declare hypotheses: any[]

    @column({
        prepare: (value: string[]) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value),
    })
    declare urgentSigns: string[]

    @column()
    declare confidence: number

    @column()
    declare processingTimeMs: number

    @column()
    declare status: 'success' | 'failed'

    @column()
    declare errorMessage: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // Relationships
    @belongsTo(() => PreDiagnosis)
    declare preDiagnosis: BelongsTo<typeof PreDiagnosis>
}
