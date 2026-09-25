import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider, type AccessToken } from '@adonisjs/auth/access_tokens'
import type { ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import VetClinic from '#models/vet_clinic'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class Veterinarian extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare clinicName: string | null

  @column()
  declare phone: string | null

  @column()
  declare address: string | null

  @column()
  declare postalCode: string | null

  @column()
  declare city: string | null

  @column()
  declare siret: string | null

  @column()
  declare website: string | null

  /** Horaires du cabinet, saisis dans les réglages. Alimente la prise de RDV. */
  @column()
  declare openingHours: object | null

  // ─── Abonnement au logiciel ───

  /** 'liberal' | 'clinique'. L'offre Réseau est sur mesure, hors paiement en ligne. */
  @column()
  declare plan: string | null

  /** Vocabulaire de Stripe : active, trialing, past_due, canceled… */
  @column()
  declare subscriptionStatus: string | null

  @column()
  declare stripeCustomerId: string | null

  @column()
  declare stripeSubscriptionId: string | null

  /** Terme de la période réglée : l'accès reste ouvert jusque-là. */
  @column.dateTime()
  declare subscriptionEndsAt: DateTime | null

  @column()
  declare licenseNumber: string | null

  @column()
  declare specialization: string | null

  // ─── Profil d'exercice (parcours d'inscription) ───

  @column()
  declare practiceType: string | null

  @column()
  declare specialties: string | null

  @column()
  declare teamSize: string | null

  @column()
  declare onboardingProfile: string | null

  @column()
  declare defaultTemplate: string | null

  @column.dateTime()
  declare onboardingCompletedAt: DateTime | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isVerified: boolean

  @column()
  declare clinicId: number | null

  @column()
  declare verificationStatus: 'pending' | 'verified' | 'rejected'

  @column()
  declare verificationNote: string | null

  @column.dateTime()
  declare verificationRequestedAt: DateTime | null

  @column({ serializeAs: null })
  declare resetToken: string | null

  @column.dateTime({ serializeAs: null })
  declare resetTokenExpiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => User, {
    pivotTable: 'user_veterinarians',
    pivotColumns: ['status', 'initiated_by', 'note', 'is_primary', 'created_at'],
  })
  declare clients: ManyToMany<typeof User>

  @belongsTo(() => VetClinic, {
    foreignKey: 'clinicId',
  })
  declare clinic: BelongsTo<typeof VetClinic>

  /**
   * Jeton ayant authentifié la requête en cours. Posé par le garde d'accès ;
   * il n'était pas déclaré, si bien que `logout` et le changement de mot de
   * passe le manipulaient hors du typage.
   */
  declare currentAccessToken?: AccessToken

  static accessTokens = DbAccessTokensProvider.forModel(Veterinarian, {
    type: 'vetAccessTokens',
    table: 'vet_access_tokens',
    // Sans échéance, un jeton dérobé une fois restait valable indéfiniment.
    // Trente jours : assez long pour ne pas redemander la connexion sans
    // cesse, assez court pour qu'une fuite ne soit pas définitive.
    expiresIn: '30 days',
  })

}
