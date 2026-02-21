import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
import logger from '@adonisjs/core/services/logger'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationNotification from '#mails/email_verification_notification'
import WelcomeNotification from '#mails/welcome_notification'
import PasswordResetNotification from '#mails/password_reset_notification'
import PasswordChangedNotification from '#mails/password_changed_notification'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import env from '#start/env'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.conflict({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }

    // Create user with verification token
    const verificationToken = randomBytes(32).toString('hex')
    const user = await User.create({
      ...data,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt: DateTime.now().plus({ hours: 24 }),
    })

    const token = await User.accessTokens.create(user)

    // Send verification email (async, don't block response)
    this.sendVerificationEmail(user).catch((error) => {
      logger.error('Failed to send verification email:', error)
    })

    return response.created({
      success: true,
      data: {
        user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
        token: { token: token.value!.release(), type: 'bearer' },
      },
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
    })
  }

  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      // Verify credentials (email + password)
      const user = await User.verifyCredentials(email, password)

      // Create access token only if credentials are valid
      const token = await User.accessTokens.create(user)

      logger.info(`User ${user.email} logged in successfully`)

      return response.ok({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl
          },
          token: { token: token.value!.release(), type: 'bearer' },
        },
      })
    } catch (error) {
      // Log failed login attempt
      logger.warn(`Failed login attempt for email: ${request.input('email')}`)

      if (error.messages) {
        return response.badRequest({
          success: false,
          message: 'Validation échouée',
          errors: error.messages,
        })
      }

      // Generic error message for security (don't reveal if email exists)
      return response.unauthorized({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user as User
    return response.ok({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        createdAt: user.createdAt,
        language: user.language,
      },
    })
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user as User
    const data = request.only(['firstName', 'lastName', 'phone', 'avatarUrl', 'language'])

    if (data.firstName !== undefined) user.firstName = data.firstName
    if (data.lastName !== undefined) user.lastName = data.lastName
    if (data.phone !== undefined) user.phone = data.phone
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl
    if (data.language !== undefined) user.language = data.language

    await user.save()

    return response.ok({
      success: true,
      message: 'Profil mis à jour',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        language: user.language,
      },
    })
  }

  async updateEmail({ auth, request, response }: HttpContext) {
    const user = auth.user as User
    const { email, password } = request.only(['email', 'password'])

    // Verify current password
    try {
      await User.verifyCredentials(user.email, password)
    } catch {
      return response.unauthorized({
        success: false,
        message: 'Mot de passe incorrect',
      })
    }

    // Check if email is already taken
    const existingUser = await User.findBy('email', email)
    if (existingUser && existingUser.id !== user.id) {
      return response.conflict({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }

    user.email = email
    await user.save()

    return response.ok({
      success: true,
      message: 'Email mis à jour',
      data: { email: user.email },
    })
  }

  async updatePassword({ auth, request, response }: HttpContext) {
    const user = auth.user as User
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    // Verify current password
    try {
      await User.verifyCredentials(user.email, currentPassword)
    } catch {
      return response.unauthorized({
        success: false,
        message: 'Mot de passe actuel incorrect',
      })
    }

    user.password = newPassword
    await user.save()

    // Send password changed confirmation email (async)
    mail.send(new PasswordChangedNotification(user)).catch((error) => {
      logger.error('Failed to send password changed email:', error)
    })

    return response.ok({
      success: true,
      message: 'Mot de passe mis à jour',
    })
  }

  /**
   * Request a password reset link
   * POST /auth/forgot-password
   */
  async forgotPassword({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    const user = await User.findBy('email', email)

    // Always return success to avoid email enumeration
    if (!user) {
      return response.ok({
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      })
    }

    // Generate reset token (1 hour expiry)
    user.resetToken = randomBytes(32).toString('hex')
    user.resetTokenExpiresAt = DateTime.now().plus({ hours: 1 })
    await user.save()

    const frontendUrl = env.get('VET_FRONTEND_URL') || 'http://localhost:3000'
    const resetUrl = `${frontendUrl}/reset-password/${user.resetToken}`

    mail.send(new PasswordResetNotification(user, resetUrl)).catch((error) => {
      logger.error('Failed to send password reset email:', error)
    })

    logger.info(`Password reset email requested for ${user.email}`)

    return response.ok({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    })
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  async resetPassword({ request, response }: HttpContext) {
    const { token, password } = request.only(['token', 'password'])

    const user = await User.query()
      .where('resetToken', token)
      .whereNotNull('resetToken')
      .first()

    if (!user) {
      return response.badRequest({
        success: false,
        message: 'Lien de réinitialisation invalide ou expiré.',
      })
    }

    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < DateTime.now()) {
      return response.badRequest({
        success: false,
        message: 'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
        code: 'TOKEN_EXPIRED',
      })
    }

    user.password = password
    user.resetToken = null
    user.resetTokenExpiresAt = null
    await user.save()

    // Send confirmation email (async)
    mail.send(new PasswordChangedNotification(user)).catch((error) => {
      logger.error('Failed to send password changed email:', error)
    })

    logger.info(`Password reset successfully for ${user.email}`)

    return response.ok({
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    })
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user as User

      // Try to delete the current access token if it exists
      if (auth.user && 'currentAccessToken' in auth.user && auth.user.currentAccessToken) {
        await User.accessTokens.delete(user, auth.user.currentAccessToken.identifier)
      }

      return response.ok({
        success: true,
        message: 'Déconnexion réussie',
      })
    } catch (error) {
      // Even if token deletion fails, return success
      // The frontend will clear local storage anyway
      return response.ok({
        success: true,
        message: 'Déconnexion réussie',
      })
    }
  }

  /**
   * Verify email with token
   * GET /auth/verify-email/:token
   */
  async verifyEmail({ params, response }: HttpContext) {
    const { token } = params

    const user = await User.query()
      .where('verificationToken', token)
      .where('emailVerified', false)
      .first()

    if (!user) {
      return response.badRequest({
        success: false,
        message: 'Token de vérification invalide ou expiré',
      })
    }

    // Check if token expired
    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < DateTime.now()) {
      return response.badRequest({
        success: false,
        message: 'Ce lien de vérification a expiré. Veuillez demander un nouveau lien.',
        code: 'TOKEN_EXPIRED',
      })
    }

    // Mark email as verified
    user.emailVerified = true
    user.emailVerifiedAt = DateTime.now()
    user.verificationToken = null
    user.verificationTokenExpiresAt = null
    await user.save()

    logger.info(`Email verified for user ${user.email}`)

    // Send welcome email (async, don't block response)
    mail.send(new WelcomeNotification(user)).catch((error) => {
      logger.error('Failed to send welcome email:', error)
    })

    return response.ok({
      success: true,
      message: 'Email vérifié avec succès !',
      data: { emailVerified: true },
    })
  }

  /**
   * Resend verification email
   * POST /auth/resend-verification
   */
  async resendVerification({ auth, response }: HttpContext) {
    const user = auth.user as User

    if (user.emailVerified) {
      return response.badRequest({
        success: false,
        message: 'Votre email est déjà vérifié',
      })
    }

    // Generate new verification token
    user.verificationToken = randomBytes(32).toString('hex')
    user.verificationTokenExpiresAt = DateTime.now().plus({ hours: 24 })
    await user.save()

    // Send verification email
    try {
      await this.sendVerificationEmail(user)

      return response.ok({
        success: true,
        message: 'Email de vérification renvoyé. Vérifiez votre boîte de réception.',
      })
    } catch (error) {
      logger.error('Failed to resend verification email:', error)

      return response.internalServerError({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.',
      })
    }
  }

  /**
   * Send verification email to user
   * Private helper method
   */
  private async sendVerificationEmail(user: User): Promise<void> {
    // Check if email is configured
    const smtpHost = env.get('SMTP_HOST')
    if (!smtpHost || smtpHost.length === 0) {
      logger.warn(`Email not configured - skipping verification email for ${user.email}`)
      return
    }

    const frontendUrl = env.get('VET_FRONTEND_URL') || 'http://localhost:3000'
    const verificationUrl = `${frontendUrl}/verify-email/${user.verificationToken}`

    await mail.send(new EmailVerificationNotification(user, verificationUrl))
    logger.info(`Verification email sent to ${user.email}`)
  }
}
