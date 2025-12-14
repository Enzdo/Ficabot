import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import ChatMessage from '#models/chat_message'

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

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Pet)
  declare pets: HasMany<typeof Pet>

  @hasMany(() => ChatMessage)
  declare chatMessages: HasMany<typeof ChatMessage>

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    type: 'accessTokens',
  })

  @beforeSave()
  static async hashPassword(user: User | any) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}
