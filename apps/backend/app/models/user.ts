import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import ChatMessage from '#models/chat_message'
import Veterinarian from '#models/veterinarian'

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
  declare password: string

  @column()
  declare emailVerified: boolean

  @column({ serializeAs: null })
  declare verificationToken: string | null

  @column.dateTime({ serializeAs: null })
  declare verificationTokenExpiresAt: DateTime | null

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

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

  @beforeSave()
  static async hashPassword(user: User | any) {
    if (user.$dirty.password) {
      user.password = await hash.use('scrypt').make(user.password)
    }
  }
}
