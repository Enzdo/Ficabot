import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'

export type DictationStatus = 'pending' | 'transcribing' | 'structuring' | 'done' | 'failed'

/** États dont un travail peut encore sortir : ceux qu'un redémarrage interrompt. */
export const RUNNING_STATUSES: DictationStatus[] = ['pending', 'transcribing', 'structuring']

export default class VetDictation extends BaseModel {
  static table = 'vet_dictations'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare status: DictationStatus

  @column()
  declare language: string

  @column()
  declare templateId: string | null

  @column()
  declare instruction: string | null

  @column()
  declare petToken: string | null

  @column()
  declare transcript: string | null

  /**
   * Compte rendu structuré, sérialisé. Stocké en texte plutôt qu'en json natif
   * pour rester indifférent au moteur de base, comme les autres modèles du
   * projet ; la conversion se fait ici et nulle part ailleurs.
   */
  @column({
    prepare: (value: unknown) => (value == null ? null : JSON.stringify(value)),
    consume: (value: string | null) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    },
  })
  declare draft: Record<string, unknown> | null

  @column()
  declare errorMessage: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime | null

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>

  get isRunning() {
    return RUNNING_STATUSES.includes(this.status)
  }
}
