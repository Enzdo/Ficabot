import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import User from '#models/user'
import type { TrainingAxis } from '#services/training/questionnaire'
import type { TrainingPlan } from '#services/training_service'

export type TrainingLevel = 'debutant' | 'apprenti' | 'confirme' | 'expert'
export type PlanStatus = 'none' | 'processing' | 'completed' | 'failed'

/** Postgres renvoie déjà l'objet, sqlite une chaîne : on accepte les deux. */
const jsonColumn = {
  prepare: (value: unknown) => JSON.stringify(value),
  consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
}

export default class TrainingAssessment extends BaseModel {
  static table = 'training_assessments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare userId: number

  @column(jsonColumn)
  declare answers: Record<string, string>

  @column(jsonColumn)
  declare context: Record<string, string>

  @column(jsonColumn)
  declare scores: Record<TrainingAxis, number>

  @column()
  declare overallScore: number

  @column()
  declare level: TrainingLevel

  @column({
    ...jsonColumn,
    prepare: (value: unknown) => (value === null || value === undefined ? null : JSON.stringify(value)),
    consume: (value: unknown) =>
      value === null || value === undefined
        ? null
        : typeof value === 'string'
          ? JSON.parse(value)
          : value,
  })
  declare plan: TrainingPlan | null

  @column()
  declare planStatus: PlanStatus

  @column()
  declare planError: string | null

  @column()
  declare planFromAi: boolean

  @column.dateTime()
  declare planGeneratedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
