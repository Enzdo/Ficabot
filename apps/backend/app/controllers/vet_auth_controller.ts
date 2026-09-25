import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetClinic from '#models/vet_clinic'
import { vetRegisterValidator, vetLoginValidator, vetUpdateProfileValidator } from '#validators/vet_auth'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'
import { hasActiveAccess } from '#services/vet_access'
import * as throttle from '#services/login_throttle'
import env from '#start/env'
import WelcomeVetNotification from '#mails/welcome_vet_notification'
import PasswordResetVetNotification from '#mails/password_reset_vet_notification'
import PasswordChangedVetNotification from '#mails/password_changed_vet_notification'

export default class VetAuthController {
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

    let vet: Veterinarian
    try {
      vet = await Veterinarian.verifyCredentials(email, password)
    } catch {
      // Laissée remonter, l'exception d'identifiants s'auto-rend en texte brut
      // — faute de middleware de session, elle choisit la branche « html ». Le
      // composable tentait alors d'en lire du JSON, échouait, et affichait
      // « Erreur de connexion au serveur » : le praticien partait chercher une
      // panne réseau au lieu de corriger son mot de passe.
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
        },
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  async me({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    return response.ok({
      success: true,
      data: {
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
        createdAt: vet.createdAt,
      },
    })
  }

  async updateProfile({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = await request.validateUsing(vetUpdateProfileValidator)

    vet.merge(data)
    await vet.save()

    return response.ok({
      success: true,
      data: {
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
      },
    })
  }

  /**
   * Révoque les jetons d'accès du praticien, hormis celui passé en second
   * argument. Un échec de révocation n'est pas silencieux : mieux vaut un
   * journal qui alerte qu'une session qu'on croit fermée et qui ne l'est pas.
   */
  private async revokeTokens(vet: Veterinarian, keepIdentifier?: string | number | BigInt) {
    const tokens = await Veterinarian.accessTokens.all(vet)

    for (const token of tokens) {
      if (keepIdentifier !== undefined && String(token.identifier) === String(keepIdentifier)) {
        continue
      }
      try {
        await Veterinarian.accessTokens.delete(vet, token.identifier)
      } catch (error) {
        logger.error({ err: error, vetId: vet.id }, 'Échec de révocation d’un jeton vétérinaire')
      }
    }
  }

  async logout({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await Veterinarian.accessTokens.delete(vet, vet.currentAccessToken!.identifier)

    return response.ok({
      success: true,
      message: 'Déconnexion réussie',
    })
  }

  async changePassword({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    // Verify current password
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

    // Les autres sessions tombent : sans cela, reprendre son mot de passe après
    // une compromission ne délogeait pas l'intrus. Celle en cours est conservée,
    // pour ne pas éjecter le praticien de l'écran où il vient d'agir.
    await this.revokeTokens(vet, vet.currentAccessToken?.identifier)

    // Send confirmation email (async)
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

    // Toutes les sessions tombent, sans exception : une réinitialisation est
    // souvent la réaction à une perte de contrôle du compte. En laisser une
    // seule debout viderait la manœuvre de son sens.
    await this.revokeTokens(vet)

    mail.send(new PasswordChangedVetNotification(vet)).catch((error) => {
      logger.error({ err: error }, 'Failed to send vet password changed email')
    })

    logger.info(`Vet password reset successfully for ${vet.email}`)

    return response.ok({
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    })
  }

  async deleteAccount({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await Veterinarian.accessTokens.delete(vet, vet.currentAccessToken!.identifier)
    await vet.delete()

    return response.ok({
      success: true,
      message: 'Compte supprimé',
    })
  }
}
