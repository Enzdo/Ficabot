import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import User from '#models/user'
import TrainingAssessment from '#models/training_assessment'
import TrainingTaskLog from '#models/training_task_log'
import type { TrainingAxis } from '#services/training/questionnaire'
import type { TrainingPlan } from '#services/training_service'

export type ProgramStatus = 'active' | 'completed'

export interface ScoreSnapshot {
  at: string
  cycle: number
  /** 0 pour le bilan initial, 1→4 pour la semaine que le point clôture. */
  week: number
  scores: Record<TrainingAxis, number>
  overallScore: number
  source: 'initial' | 'weekly'
}

const jsonColumn = {
  prepare: (value: unknown) => JSON.stringify(value),
  consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
}

export default class TrainingProgram extends BaseModel {
  static table = 'training_programs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare userId: number

  @column()
  declare assessmentId: number

  @column(jsonColumn)
  declare plan: TrainingPlan

  @column(jsonColumn)
  declare scores: Record<TrainingAxis, number>

  @column(jsonColumn)
  declare scoresHistory: ScoreSnapshot[]

  @column()
  declare overallScore: number

  @column()
  declare level: string

  @column()
  declare cycle: number

  @column()
  declare currentWeek: number

  @column.dateTime()
  declare weekStartedAt: DateTime

  @column()
  declare status: ProgramStatus

  @column()
  declare planFromAi: boolean

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TrainingAssessment, { foreignKey: 'assessmentId' })
  declare assessment: BelongsTo<typeof TrainingAssessment>

  @hasMany(() => TrainingTaskLog)
  declare taskLogs: HasMany<typeof TrainingTaskLog>

  /** Le bilan de la semaine est dû sept jours après son début. */
  get checkinDue(): boolean {
    if (this.status !== 'active') return false
    return DateTime.now() >= this.weekStartedAt.plus({ days: 7 })
  }

  /** Jours restants avant le prochain bilan (0 s'il est déjà dû). */
  get daysUntilCheckin(): number {
    const days = Math.ceil(this.weekStartedAt.plus({ days: 7 }).diffNow('days').days)
    return Math.max(0, days)
  }

  /** Jours écoulés depuis le début de la semaine en cours. */
  get daysSinceWeekStart(): number {
    return Math.floor(Math.abs(this.weekStartedAt.diffNow('days').days))
  }

  /**
   * Au-delà de deux semaines sans bilan, le suivi est décroché : répondre à des
   * questions sur « la semaine écoulée » n'a plus de sens, et laisser la
   * semaine verrouillée indéfiniment condamne le programme. On propose alors de
   * reprendre la semaine à zéro.
   */
  get isStale(): boolean {
    return this.status === 'active' && this.daysSinceWeekStart >= 14
  }
}
