import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TrainingProgram from '#models/training_program'
import User from '#models/user'

/**
 * Un exercice coché, un jour donné. L'absence de ligne vaut « pas fait » :
 * pré-créer les tâches de la semaine obligerait à les régénérer à chaque
 * changement de plan, pour la même information.
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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => TrainingProgram)
  declare program: BelongsTo<typeof TrainingProgram>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
