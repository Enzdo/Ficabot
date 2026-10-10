import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ReportTemplate extends BaseModel {
  public static table = 'report_templates'

  @column({ isPrimary: true })
  declare id: number

  /** Nul = modèle général fourni avec le produit */
  @column()
  declare veterinarianId: number | null

  @column()
  declare slug: string | null

  @column()
  declare name: string

  @column()
  declare category: string | null

  @column()
  declare description: string | null

  /** Rubriques sérialisées : [{ key, label, hint }] */
  @column()
  declare sections: string

  @column()
  declare isBuiltin: boolean

  /**
   * `slug` du modèle fourni dont cette ligne prend la place pour son praticien.
   * Nul pour un modèle fourni comme pour un modèle créé de toutes pièces.
   */
  @column()
  declare overridesSlug: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
