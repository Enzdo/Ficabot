import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import ChatMessage from '#models/chat_message'
import Veterinarian from '#models/veterinarian'
import { isPremiumEnforced } from '#services/premium_service'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare phone: string | null

  @column()
  declare language: string

  @column({ serializeAs: null })
  declare password: string | null

  @column()
  declare googleId: string | null

  /** Ville saisie à l'onboarding, pour les conseils liés à la météo. */
  @column()
  declare city: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare emailVerified: boolean

  @column({ serializeAs: null })
  declare verificationToken: string | null

  @column.dateTime({ serializeAs: null })
  declare verificationTokenExpiresAt: DateTime | null

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column({ serializeAs: null })
  declare resetToken: string | null

  @column.dateTime({ serializeAs: null })
  declare resetTokenExpiresAt: DateTime | null

  @column()
  declare isPremium: boolean

  @column.dateTime()
  declare premiumSince: DateTime | null

  @column.dateTime()
  declare premiumExpiresAt: DateTime | null

  @column()
  declare premiumPlan: string | null

  @column()
  declare premiumProvider: string | null

  @column({ serializeAs: null })
  declare premiumSubscriptionId: string | null

  /**
   * État réel de l'abonnement : payé et non expiré.
   * Sert à l'affichage de l'abonnement, pas au déblocage des fonctionnalités.
   */
  get hasActivePremium(): boolean {
    if (!this.isPremium) return false
    if (!this.premiumExpiresAt) return true
    return this.premiumExpiresAt > DateTime.now()
  }

  /**
   * Droit d'accès aux fonctionnalités Premium.
   * Tant que `PREMIUM_ENFORCED` n'est pas activé, tout le monde y a accès.
   */
  get hasPremiumAccess(): boolean {
    return !isPremiumEnforced() || this.hasActivePremium
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Pet)
  declare pets: HasMany<typeof Pet>

  @hasMany(() => ChatMessage)
  declare chatMessages: HasMany<typeof ChatMessage>

  @manyToMany(() => Veterinarian, {
    pivotTable: 'user_veterinarians',
    pivotColumns: ['status', 'initiated_by', 'note', 'is_primary', 'created_at'],
  })
  declare veterinarians: ManyToMany<typeof Veterinarian>

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    type: 'accessTokens',
  })
}
