import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TrainingProgram from '#models/training_program'
import User from '#models/user'

/**
 * Trace d'un exercice pour un jour donné : coché, annoté, ou les deux.
 *
 * L'absence de ligne vaut « pas fait, rien à dire » : pré-créer les tâches de
 * la semaine obligerait à les régénérer à chaque changement de plan, pour la
 * même information. Une ligne n'est conservée que si elle porte quelque chose —
 * une coche ou une note.
 */
export default class TrainingTaskLog extends BaseModel {
  static table = 'training_task_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare programId: number

  @column()
  declare userId: number

  @column.date()
  declare day: DateTime

  /** Forme `c{cycle}-w{semaine}-e{index}`. */
  @column()
  declare taskKey: string

  /** Exercice réellement effectué. Une note peut exister sans, et l'inverse. */
  @column()
  declare done: boolean

  /** Observation libre du propriétaire, relue par le modèle en fin de cycle. */
  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => TrainingProgram)
  declare program: BelongsTo<typeof TrainingProgram>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
