import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetEmployee from '#models/vet_employee'
import VetClinic from '#models/vet_clinic'
import { vetRegisterValidator, vetLoginValidator, vetUpdateProfileValidator } from '#validators/vet_auth'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'
import { hasActiveAccess } from '#services/vet_access'
import { employeeAbility } from '#services/vet_actor'
import { ownerCapabilities, resolveCapabilities } from '#services/vet_permissions'
import {
  revokeAllSessions,
  revokeEmployeeSessions,
  revokeOwnerSessions,
} from '#services/vet_sessions'
import type { Capability } from '#services/vet_permissions'
import * as throttle from '#services/login_throttle'
import env from '#start/env'
import WelcomeVetNotification from '#mails/welcome_vet_notification'
import PasswordResetVetNotification from '#mails/password_reset_vet_notification'
import PasswordChangedVetNotification from '#mails/password_changed_vet_notification'

export default class VetAuthController {
  /**
   * Identité du cabinet, telle que le logiciel l'affiche. Inchangée depuis
   * l'introduction des employés : elle décrit le lieu d'exercice, pas la
   * personne aux commandes — celle-ci est décrite par `actor`.
   */
  private clinicPayload(vet: Veterinarian) {
    return {
      id: vet.id,
      email: vet.email,
      firstName: vet.firstName,
      lastName: vet.lastName,
      clinicName: vet.clinicName,
      phone: vet.phone,
      address: vet.address,
      licenseNumber: vet.licenseNumber,
      specialization: vet.specialization,
      isVerified: vet.isVerified,
      subscriptionActive: hasActiveAccess(vet),
    }
  }

  /**
   * Qui agit, et ce qu'il a le droit d'ouvrir. Le logiciel s'en sert pour
   * n'afficher que les écrans permis — la grille est aussi appliquée côté
   * serveur, l'affichage n'étant qu'une politesse, jamais une garantie.
   */
  private actorPayload(vet: Veterinarian, employee: VetEmployee | null) {
    const capabilities: Capability[] = employee
      ? resolveCapabilities(employee.role, employee.capabilities)
      : ownerCapabilities()

    return {
      kind: employee ? ('employee' as const) : ('owner' as const),
      employeeId: employee?.id ?? null,
      role: employee?.role ?? null,
      firstName: employee?.firstName ?? vet.firstName,
      lastName: employee?.lastName ?? vet.lastName,
      email: employee?.email ?? vet.email,
      capabilities,
    }
  }

  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(vetRegisterValidator)

    const existingVet = await Veterinarian.findBy('email', data.email)
    if (existingVet) {
      return response.conflict({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }

    // Handle clinic selection
    let clinicId: number | null = null
    
    if (data.clinicData) {
      // Create or get clinic from Google Places data
      let clinic = await VetClinic.findBy('place_id', data.clinicData.placeId)
      
      if (!clinic) {
        clinic = await VetClinic.create({
          placeId: data.clinicData.placeId,
          name: data.clinicData.name,
          address: data.clinicData.address,
          latitude: data.clinicData.latitude,
          longitude: data.clinicData.longitude,
          phone: data.clinicData.phone || null,
          website: data.clinicData.website || null,
          rating: data.clinicData.rating || null,
          userRatingsTotal: data.clinicData.userRatingsTotal || null,
          isVerified: false,
        })
      }
      clinicId = clinic.id
    } else if (data.clinicId) {
      clinicId = data.clinicId
    }

    const vet = await Veterinarian.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      clinicName: data.clinicName,
      phone: data.phone,
      address: data.address,
      licenseNumber: data.licenseNumber,
      specialization: data.specialization,
      isVerified: false,
      clinicId,
      // Le ternaire d'origine renvoyait 'pending' dans les deux branches, et rien
      // dans le code ne faisait jamais passer ce statut à 'verified' : l'envoi de
      // messages aux clients, qui l'exige, était donc bloqué pour tous les
      // comptes. Aucune vérification d'ordinal n'existe par ailleurs — le statut
      // ne vérifiait rien. On l'assume ouvert plutôt que fermé sur une erreur.
      verificationStatus: 'verified',
      verificationRequestedAt: clinicId ? DateTime.now() : null,
    })
    const token = await Veterinarian.accessTokens.create(vet)

    // Load clinic relation
    if (clinicId) {
      await vet.load('clinic')
    }

    // Send welcome email (async, don't block response)
    mail.send(new WelcomeVetNotification(vet)).catch((error) => {
      logger.error({ err: error }, 'Failed to send vet welcome email')
    })

    return response.created({
      success: true,
      data: {
        vet: {
          id: vet.id,
          email: vet.email,
          firstName: vet.firstName,
          lastName: vet.lastName,
          clinicName: vet.clinicName,
          phone: vet.phone,
          address: vet.address,
          licenseNumber: vet.licenseNumber,
          specialization: vet.specialization,
          isVerified: vet.isVerified,
          subscriptionActive: hasActiveAccess(vet),
          verificationStatus: vet.verificationStatus,
          clinic: vet.clinic ? {
            id: vet.clinic.id,
            name: vet.clinic.name,
            address: vet.clinic.address,
          } : null,
        },
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(vetLoginValidator)

    const throttleKey = `login:${request.ip()}:${email.toLowerCase()}`
    const verdict = throttle.hit(throttleKey, 10, 15 * 60 * 1000)

    if (!verdict.allowed) {
      return response.tooManyRequests({
        success: false,
        message: `Trop de tentatives. Réessayez dans ${Math.ceil(verdict.retryAfter / 60)} minutes.`,
        code: 'TOO_MANY_ATTEMPTS',
      })
    }

    let vet: Veterinarian | null = null
    try {
      vet = await Veterinarian.verifyCredentials(email, password)
    } catch {
      // L'exception n'est pas laissée remonter : elle s'auto-rend en texte brut
      // — faute de middleware de session, elle choisit la branche « html ». Le
      // composable tentait alors d'en lire du JSON, échouait, et affichait
      // « Erreur de connexion au serveur » : le praticien partait chercher une
      // panne réseau au lieu de corriger son mot de passe.
      vet = null
    }

    // Une seule porte d'entrée, pour le titulaire comme pour ses employés :
    // demander à chacun de choisir le bon formulaire serait une friction
    // gratuite. La résolution reste sans ambiguïté — l'adresse d'un employé
    // ayant un accès est unique, et l'octroi refuse celle d'un titulaire.
    if (!vet) {
      const employee = await VetEmployee.verifyForLogin(email, password)
      if (employee) return this.loginAsEmployee(employee, throttleKey, response)

      return response.badRequest({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      })
    }

    throttle.clear(throttleKey)
    const token = await Veterinarian.accessTokens.create(vet)

    return response.ok({
      success: true,
      data: {
        vet: this.clinicPayload(vet),
        actor: this.actorPayload(vet, null),
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  /**
   * Ouvre une session d'employé.
   *
   * Le jeton est posé sur le compte du cabinet et marqué du nom de l'employé :
   * le cloisonnement des données reste celui du cabinet — ce que l'employé doit
   * précisément voir — et les 117 requêtes du logiciel n'ont pas à changer.
   */
  private async loginAsEmployee(
    employee: VetEmployee,
    throttleKey: string,
    response: HttpContext['response']
  ) {
    const vet = await Veterinarian.find(employee.veterinarianId)

    if (!vet) {
      // Fiche orpheline : anormal, et sans recours pour l'employé. On journalise
      // plutôt que de laisser une erreur muette.
      logger.error(
        { employeeId: employee.id, veterinarianId: employee.veterinarianId },
        'Employé rattaché à un cabinet inexistant'
      )
      return response.badRequest({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      })
    }

    if (!hasActiveAccess(vet)) {
      // L'employé ne peut pas régler l'abonnement à la place du titulaire :
      // l'envoyer sur l'écran de paiement serait un cul-de-sac. On nomme la
      // cause, pour qu'il sache à qui s'adresser.
      return response.forbidden({
        success: false,
        message: "L'accès du cabinet au logiciel est suspendu. Contactez le titulaire.",
        code: 'CLINIC_SUBSCRIPTION_INACTIVE',
      })
    }

    throttle.clear(throttleKey)
    const token = await Veterinarian.accessTokens.create(vet, [employeeAbility(employee.id)])

    employee.lastLoginAt = DateTime.now()
    await employee.save()

    return response.ok({
      success: true,
      data: {
        vet: this.clinicPayload(vet),
        actor: this.actorPayload(vet, employee),
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  async me(ctx: HttpContext) {
    const { response } = ctx
    const actor = ctx.vetActor!
    const vet = actor.veterinarian

    // Forme historique conservée à plat — le logiciel lit `data.clinicName`
    // depuis toujours —, enrichie de `actor` pour savoir qui est aux commandes.
    return response.ok({
      success: true,
      data: {
        ...this.clinicPayload(vet),
        createdAt: vet.createdAt,
        actor: this.actorPayload(vet, actor.employee),
      },
    })
  }

  async updateProfile(ctx: HttpContext) {
    const { request, response } = ctx
    const actor = ctx.vetActor!

    // La route est déjà réservée au titulaire par la grille de droits. Cette
    // seconde vérification tient pour ce qu'elle est — une ceinture en plus du
    // harnais : la fiche modifiée ici est celle du cabinet, et une erreur
    // d'assemblage des middlewares ne doit pas laisser un employé la réécrire.
    if (!actor.isOwner) {
      return response.forbidden({
        success: false,
        message: 'Seul le titulaire du cabinet peut modifier ces informations.',
        code: 'OWNER_ONLY',
      })
    }

    const vet = actor.veterinarian
    const data = await request.validateUsing(vetUpdateProfileValidator)

    vet.merge(data)
    await vet.save()

    return response.ok({ success: true, data: this.clinicPayload(vet) })
  }

  async logout({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await Veterinarian.accessTokens.delete(vet, vet.currentAccessToken!.identifier)

    return response.ok({
      success: true,
      message: 'Déconnexion réussie',
    })
  }

  /**
   * Change le mot de passe de la personne connectée — le titulaire, ou l'employé
   * aux commandes. Le même écran sert les deux : chacun modifie le sien.
   */
  async changePassword(ctx: HttpContext) {
    const { request, response } = ctx
    const actor = ctx.vetActor!
    const vet = actor.veterinarian
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return response.badRequest({
        success: false,
        message: 'Le nouveau mot de passe doit faire au moins 8 caractères.',
      })
    }

    const current = vet.currentAccessToken?.identifier

    if (actor.employee) {
      const employee = actor.employee
      const verified = await VetEmployee.verifyForLogin(employee.email ?? '', String(currentPassword))

      if (!verified || verified.id !== employee.id) {
        return response.badRequest({
          success: false,
          message: 'Mot de passe actuel incorrect',
        })
      }

      employee.password = String(newPassword)
      await employee.save()

      // Seules les sessions de cet employé tombent. Celles de ses collègues et
      // du titulaire ne sont pas concernées par son mot de passe.
      await revokeEmployeeSessions(vet, employee.id, current)

      return response.ok({
        success: true,
        message: 'Mot de passe modifié avec succès',
      })
    }

    try {
      await Veterinarian.verifyCredentials(vet.email, currentPassword)
    } catch {
      return response.badRequest({
        success: false,
        message: 'Mot de passe actuel incorrect',
      })
    }

    vet.password = newPassword
    await vet.save()

    // Les autres sessions du titulaire tombent : sans cela, reprendre son mot de
    // passe après une compromission ne délogeait pas l'intrus. Celle en cours
    // est conservée, pour ne pas l'éjecter de l'écran où il vient d'agir — et
    // celles de l'équipe aussi : son mot de passe n'est pas le leur, les
    // déconnecter en pleine journée serait une surprise gratuite.
    await revokeOwnerSessions(vet, current)

    mail.send(new PasswordChangedVetNotification(vet)).catch((error) => {
      logger.error({ err: error }, 'Failed to send vet password changed email')
    })

    return response.ok({
      success: true,
      message: 'Mot de passe modifié avec succès',
    })
  }

  async forgotPassword({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    // Chaque appel réécrit le jeton de réinitialisation et déclenche un envoi :
    // sans limite, l'adresse d'un confrère pouvait être bombardée, et son lien
    // en cours invalidé à chaque fois.
    const verdict = throttle.hit(
      `forgot:${request.ip()}:${String(email).toLowerCase()}`,
      5,
      60 * 60 * 1000
    )

    if (!verdict.allowed) {
      return response.tooManyRequests({
        success: false,
        message: 'Trop de demandes. Réessayez dans une heure.',
        code: 'TOO_MANY_ATTEMPTS',
      })
    }

    const vet = await Veterinarian.findBy('email', email)

    // Always return success to avoid email enumeration
    if (!vet) {
      return response.ok({
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      })
    }

    vet.resetToken = randomBytes(32).toString('hex')
    vet.resetTokenExpiresAt = DateTime.now().plus({ hours: 1 })
    await vet.save()

    const frontendUrl = env.get('VET_FRONTEND_URL') || 'http://localhost:3001'
    const resetUrl = `${frontendUrl}/reset-password/${vet.resetToken}`

    mail.send(new PasswordResetVetNotification(vet, resetUrl)).catch((error) => {
      logger.error({ err: error }, 'Failed to send vet password reset email')
    })

    logger.info(`Vet password reset email requested for ${vet.email}`)

    return response.ok({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    })
  }

  async resetPassword({ request, response }: HttpContext) {
    const { token, password } = request.only(['token', 'password'])

    const vet = await Veterinarian.query()
      .where('resetToken', token)
      .whereNotNull('resetToken')
      .first()

    if (!vet) {
      return response.badRequest({
        success: false,
        message: 'Lien de réinitialisation invalide ou expiré.',
      })
    }

    if (vet.resetTokenExpiresAt && vet.resetTokenExpiresAt < DateTime.now()) {
      return response.badRequest({
        success: false,
        message: 'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
        code: 'TOKEN_EXPIRED',
      })
    }

    vet.password = password
    vet.resetToken = null
    vet.resetTokenExpiresAt = null
    await vet.save()

    // Toutes les sessions tombent, sans exception — employés compris : une
    // réinitialisation est souvent la réaction à une perte de contrôle du
    // compte. En laisser une seule debout viderait la manœuvre de son sens.
    await revokeAllSessions(vet)

    mail.send(new PasswordChangedVetNotification(vet)).catch((error) => {
      logger.error({ err: error }, 'Failed to send vet password changed email')
    })

    logger.info(`Vet password reset successfully for ${vet.email}`)

    return response.ok({
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    })
  }

  async deleteAccount(ctx: HttpContext) {
    const { response } = ctx
    const actor = ctx.vetActor!

    // Geste irréversible, et qui emporte tout le cabinet : il n'appartient qu'au
    // titulaire, quelle que soit la grille de droits de l'employé.
    if (!actor.isOwner) {
      return response.forbidden({
        success: false,
        message: 'Seul le titulaire du cabinet peut supprimer ce compte.',
        code: 'OWNER_ONLY',
      })
    }

    const vet = actor.veterinarian
    await Veterinarian.accessTokens.delete(vet, vet.currentAccessToken!.identifier)
    await vet.delete()

    return response.ok({
      success: true,
      message: 'Compte supprimé',
    })
  }
}
