import type { HttpContext } from '@adonisjs/core/http'
import VetEmployee from '#models/vet_employee'
import Veterinarian from '#models/veterinarian'
import { CAPABILITIES, OWNER_ONLY, resolveCapabilities } from '#services/vet_permissions'
import type { Capability, EmployeeRole } from '#services/vet_permissions'
import { revokeEmployeeSessions } from '#services/vet_sessions'

const ROLES: EmployeeRole[] = ['vet', 'assistant', 'receptionist', 'groomer', 'other']

const MIN_PASSWORD_LENGTH = 8

/**
 * L'équipe d'un cabinet : les fiches, et les accès au logiciel.
 *
 * Tout passe par le titulaire — la grille de droits lui réserve ce domaine, et
 * il n'est pas délégable : confier la gestion des accès reviendrait à confier la
 * capacité de se donner tous les droits.
 */
export default class VetEmployeesController {
  /**
   * Une adresse vide n'est pas une adresse : le formulaire envoie `''` quand le
   * champ n'est pas rempli, et deux chaînes vides se heurteraient à l'unicité
   * des identifiants de connexion. On la ramène à « absente ».
   */
  private normalizeEmail(value: unknown): string | null | undefined {
    if (value === undefined) return undefined
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed.toLowerCase()
  }

  private payload(employee: VetEmployee) {
    return {
      id: employee.id,
      veterinarianId: employee.veterinarianId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      avatarUrl: employee.avatarUrl,
      role: employee.role,
      specializations: employee.specializations,
      workingHours: employee.workingHours,
      color: employee.color,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      /**
       * Peut se connecter. Distinct d'`isActive`, qui n'archive que la fiche :
       * l'écran d'équipe doit pouvoir montrer « employé présent, sans accès ».
       */
      hasAccess: employee.hasAccess,
      lastLoginAt: employee.lastLoginAt,
      /** Écarts voulus par le titulaire ; le reste vient du rôle. */
      capabilityOverrides: employee.capabilities ?? {},
      /** Droits effectifs, rôle et dérogations combinés. */
      capabilities: resolveCapabilities(employee.role, employee.capabilities),
    }
  }

  private async find(vet: Veterinarian, id: unknown) {
    const numericId = Number(id)
    if (!Number.isInteger(numericId)) return null

    return VetEmployee.query()
      .where('id', numericId)
      .where('veterinarian_id', vet.id)
      .first()
  }

  /**
   * Ne retient que les dérogations portant sur un domaine connu et non réservé.
   * Ce qui est ignoré l'est en silence côté données, mais la grille recalculée
   * est renvoyée à l'écran : le titulaire voit ce qui a réellement été retenu.
   */
  private sanitizeOverrides(value: unknown): Partial<Record<Capability, boolean>> | null {
    if (value === null) return null
    if (typeof value !== 'object' || Array.isArray(value)) return null

    const source = value as Record<string, unknown>
    const cleaned: Partial<Record<Capability, boolean>> = {}

    for (const capability of CAPABILITIES) {
      if (OWNER_ONLY.includes(capability)) continue
      const flag = source[capability]
      if (typeof flag === 'boolean') cleaned[capability] = flag
    }

    return Object.keys(cleaned).length > 0 ? cleaned : null
  }

  private isUniqueViolation(error: unknown): boolean {
    return (error as { code?: string })?.code === '23505'
  }

  /**
   * Refuse une adresse qui rendrait la connexion ambiguë.
   *
   * Le logiciel n'a qu'un seul formulaire de connexion, qui cherche d'abord un
   * titulaire puis un employé. Une adresse portée par les deux ferait donc
   * toujours gagner le titulaire, et l'employé ne pourrait jamais entrer — un
   * échec incompréhensible pour lui. Mieux vaut le dire à l'octroi.
   */
  private async emailConflict(email: string, employeeId: number): Promise<string | null> {
    const owner = await Veterinarian.query().whereRaw('lower(email) = ?', [email]).first()
    if (owner) {
      return 'Cette adresse est déjà celle d’un compte praticien. Utilisez une autre adresse pour cet employé.'
    }

    const other = await VetEmployee.query()
      .whereRaw('lower(email) = ?', [email])
      .whereNotNull('password')
      .whereNot('id', employeeId)
      .first()

    if (other) {
      return 'Cette adresse est déjà utilisée par un autre accès au logiciel.'
    }

    return null
  }

  async index(ctx: HttpContext) {
    const vet = ctx.vetActor!.veterinarian

    const employees = await VetEmployee.query()
      .where('veterinarian_id', vet.id)
      .orderBy('first_name', 'asc')

    return ctx.response.ok({
      success: true,
      data: employees.map((employee) => this.payload(employee)),
    })
  }

  async store({ request, response, vetActor }: HttpContext) {
    const vet = vetActor!.veterinarian
    const data = request.only([
      'firstName',
      'lastName',
      'email',
      'phone',
      'role',
      'specializations',
      'workingHours',
      'color',
    ])

    const role: EmployeeRole = ROLES.includes(data.role) ? data.role : 'other'

    const employee = await VetEmployee.create({
      ...data,
      role,
      email: this.normalizeEmail(data.email) ?? null,
      veterinarianId: vet.id,
      isActive: true,
    })

    return response.created({ success: true, data: this.payload(employee) })
  }

  async show({ params, response, vetActor }: HttpContext) {
    const employee = await this.find(vetActor!.veterinarian, params.id)

    if (!employee) {
      return response.notFound({ success: false, message: 'Employé non trouvé' })
    }

    return response.ok({ success: true, data: this.payload(employee) })
  }

  async update({ params, request, response, vetActor }: HttpContext) {
    const vet = vetActor!.veterinarian
    const employee = await this.find(vet, params.id)

    if (!employee) {
      return response.notFound({ success: false, message: 'Employé non trouvé' })
    }

    const data = request.only([
      'firstName',
      'lastName',
      'email',
      'phone',
      'role',
      'specializations',
      'workingHours',
      'color',
      'isActive',
    ])

    const email = this.normalizeEmail(data.email)

    // Changer l'adresse d'un employé qui se connecte, c'est changer son
    // identifiant : on vérifie d'abord qu'elle ne collisionne avec rien, sinon
    // il se retrouverait dehors sans comprendre pourquoi.
    if (email !== undefined && email !== null && employee.hasAccess) {
      const conflict = await this.emailConflict(email, employee.id)
      if (conflict) {
        return response.conflict({ success: false, message: conflict, code: 'EMAIL_TAKEN' })
      }
    }

    // Retirer l'adresse d'un employé lui retirerait son identifiant de
    // connexion : la fiche resterait avec un mot de passe inutilisable.
    if (email === null && employee.password) {
      return response.badRequest({
        success: false,
        message:
          'Cet employé se connecte avec cette adresse. Retirez d’abord son accès au logiciel.',
        code: 'EMAIL_REQUIRED_FOR_ACCESS',
      })
    }

    const wasActive = employee.isActive

    employee.merge({
      ...data,
      role: ROLES.includes(data.role) ? data.role : employee.role,
      ...(email === undefined ? {} : { email }),
    })

    if ('capabilityOverrides' in request.all()) {
      employee.capabilities = this.sanitizeOverrides(request.input('capabilityOverrides'))
    }

    try {
      await employee.save()
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        return response.conflict({
          success: false,
          message: 'Cette adresse est déjà utilisée par un autre accès au logiciel.',
          code: 'EMAIL_TAKEN',
        })
      }
      throw error
    }

    // Archiver une fiche doit fermer la porte tout de suite. Sans cela, un
    // employé désactivé gardait la main jusqu'à l'expiration de son jeton.
    if (wasActive && !employee.isActive) {
      await revokeEmployeeSessions(vet, employee.id)
    }

    return response.ok({ success: true, data: this.payload(employee) })
  }

  /**
   * Ouvre un accès au logiciel, ou remplace le mot de passe d'un accès existant.
   *
   * C'est le titulaire qui choisit le mot de passe et le transmet de la main à la
   * main : le cabinet n'a pas d'envoi d'e-mail fiable à ce jour, et un employé
   * bloqué faute de courriel reçu serait pire qu'un mot de passe dicté.
   */
  async grantAccess({ params, request, response, vetActor }: HttpContext) {
    const vet = vetActor!.veterinarian
    const employee = await this.find(vet, params.id)

    if (!employee) {
      return response.notFound({ success: false, message: 'Employé non trouvé' })
    }

    const password = request.input('password')
    const email = this.normalizeEmail(request.input('email')) ?? employee.email

    if (!email) {
      return response.badRequest({
        success: false,
        message: 'Une adresse e-mail est nécessaire : elle servira d’identifiant de connexion.',
        code: 'EMAIL_REQUIRED',
      })
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return response.badRequest({
        success: false,
        message: `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`,
        code: 'PASSWORD_TOO_SHORT',
      })
    }

    const conflict = await this.emailConflict(email, employee.id)
    if (conflict) {
      return response.conflict({ success: false, message: conflict, code: 'EMAIL_TAKEN' })
    }

    const hadAccess = employee.hasAccess

    employee.email = email
    employee.password = password
    // Une fiche archivée à qui l'on rouvre un accès est réactivée : laisser les
    // deux en désaccord produirait un accès accordé qui ne fonctionne pas.
    employee.isActive = true

    try {
      await employee.save()
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        return response.conflict({
          success: false,
          message: 'Cette adresse est déjà utilisée par un autre accès au logiciel.',
          code: 'EMAIL_TAKEN',
        })
      }
      throw error
    }

    // Un mot de passe remplacé ferme les sessions ouvertes avec l'ancien :
    // c'est l'usage attendu quand le titulaire le change parce qu'il a fuité.
    if (hadAccess) {
      await revokeEmployeeSessions(vet, employee.id)
    }

    return response.ok({
      success: true,
      message: hadAccess ? 'Mot de passe remplacé.' : 'Accès au logiciel ouvert.',
      data: this.payload(employee),
    })
  }

  /**
   * Retire l'accès au logiciel, sans supprimer la fiche : l'employé reste une
   * ressource d'agenda, ses rendez-vous passés gardent leur titulaire.
   */
  async revokeAccess({ params, response, vetActor }: HttpContext) {
    const vet = vetActor!.veterinarian
    const employee = await this.find(vet, params.id)

    if (!employee) {
      return response.notFound({ success: false, message: 'Employé non trouvé' })
    }

    employee.password = null
    await employee.save()

    // Les sessions tombent maintenant, et non à l'expiration du jeton : un
    // retrait d'accès qui met un mois à faire effet n'est pas un retrait.
    await revokeEmployeeSessions(vet, employee.id)

    return response.ok({
      success: true,
      message: 'Accès au logiciel retiré.',
      data: this.payload(employee),
    })
  }

  async destroy({ params, response, vetActor }: HttpContext) {
    const vet = vetActor!.veterinarian
    const employee = await this.find(vet, params.id)

    if (!employee) {
      return response.notFound({ success: false, message: 'Employé non trouvé' })
    }

    // La session tombe avant la fiche : l'inverse laisserait un jeton dont le
    // middleware ne retrouverait plus le porteur.
    await revokeEmployeeSessions(vet, employee.id)
    await employee.delete()

    return response.ok({ success: true, message: 'Employé supprimé' })
  }
}
