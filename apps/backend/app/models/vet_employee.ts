import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'
import type { Capability, EmployeeRole } from '#services/vet_permissions'

/**
 * Le mixin n'est là que pour son crochet de sauvegarde, qui chiffre le mot de
 * passe dès qu'il change. La vérification des identifiants, elle, passe par
 * `verifyForLogin` : celle du mixin lève une erreur brute sur une fiche sans
 * mot de passe, or c'est ici le cas ordinaire — un employé sans accès.
 */
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class VetEmployee extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare role: EmployeeRole

  @column()
  declare specializations: string[] | null

  @column()
  declare workingHours: {
    monday?: { start: string; end: string }
    tuesday?: { start: string; end: string }
    wednesday?: { start: string; end: string }
    thursday?: { start: string; end: string }
    friday?: { start: string; end: string }
    saturday?: { start: string; end: string }
    sunday?: { start: string; end: string }
  } | null

  @column()
  declare color: string

  @column()
  declare isActive: boolean

  /**
   * Mot de passe d'accès au logiciel. `null` = pas d'accès : la fiche n'est
   * qu'une ressource d'agenda. C'est ce champ, et non `isActive`, qui décide si
   * la personne peut se connecter.
   */
  @column({ serializeAs: null })
  declare password: string | null

  /** Dérogations à la grille du rôle. `null` = le rôle décide. */
  @column()
  declare capabilities: Partial<Record<Capability, boolean>> | null

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  /** L'employé peut-il se connecter ? */
  get hasAccess() {
    return !!this.password && this.isActive
  }

  /**
   * Cherche l'employé correspondant à ces identifiants, ou `null`.
   *
   * Ne considère que les fiches disposant d'un accès : une fiche désactivée ou
   * sans mot de passe est traitée comme inexistante. Le temps de réponse est
   * égalisé par un calcul de hachage à vide quand aucune fiche ne correspond,
   * sans quoi la rapidité du refus révélerait quelles adresses ont un compte.
   */
  static async verifyForLogin(email: string, password: string): Promise<VetEmployee | null> {
    const employee = await VetEmployee.query()
      .whereRaw('lower(email) = ?', [email.toLowerCase().trim()])
      .whereNotNull('password')
      .where('is_active', true)
      .first()

    if (!employee || !employee.password) {
      await hash.use('scrypt').make(password)
      return null
    }

    const valid = await hash.use('scrypt').verify(employee.password, password)
    return valid ? employee : null
  }
}
