import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import VetExternalClient from '#models/vet_external_client'
import MedicalRecord from '#models/medical_record'
import ChatMessage from '#models/chat_message'
import HealthBook from '#models/health_book'

export default class Pet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  /**
   * Cabinet ayant ouvert le dossier, pour un patient créé par le praticien
   * lui-même. `null` pour les animaux créés par leur propriétaire, qui sont
   * cadrés par le lien accepté entre le propriétaire et le cabinet.
   */
  @column()
  declare veterinarianId: number | null

  /** Client sans compte à qui l'animal appartient, s'il est connu. */
  @column()
  declare externalClientId: number | null

  @column()
  declare name: string

  @column()
  declare species: 'dog' | 'cat' | 'nac'

  @column()
  declare breed: string | null

  @column.date()
  declare birthDate: DateTime | null

  @column()
  declare weight: number | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare shareToken: string | null

  @column()
  declare isPublic: boolean

  @column()
  declare vetToken: string | null

  @column.dateTime()
  declare vetTokenExpiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Client sans compte à qui l'animal appartient. Prend la place du
   * propriétaire inscrit pour les patients ouverts par le cabinet.
   */
  @belongsTo(() => VetExternalClient, { foreignKey: 'externalClientId' })
  declare externalClient: BelongsTo<typeof VetExternalClient>

  @hasMany(() => MedicalRecord)
  declare medicalRecords: HasMany<typeof MedicalRecord>

  @hasMany(() => ChatMessage)
  declare chatMessages: HasMany<typeof ChatMessage>

  @hasOne(() => HealthBook)
  declare healthBook: HasOne<typeof HealthBook>
}
