import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
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
  declare licenseNumber: string | null

  @column()
  declare specialization: string | null

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

  static accessTokens = DbAccessTokensProvider.forModel(Veterinarian, {
    type: 'vetAccessTokens',
  })

  @beforeSave()
  static async hashPassword(vet: Veterinarian | any) {
    if (vet.$dirty.password) {
      vet.password = await hash.make(vet.password)
    }
  }
}
