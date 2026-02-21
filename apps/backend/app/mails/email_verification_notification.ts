import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'

/**
 * Email verification notification
 */
export default class EmailVerificationNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@mbtilove.fr'
  subject = 'Vérifiez votre adresse email - Ficabot'

  constructor(
    private user: User,
    private verificationUrl: string
  ) {
    super()
  }

  /**
   * Prepare the email content
   */
  prepare() {
    this.message
      .to(this.user.email)
      .htmlView('emails/email_verification', {
        user: this.user,
        verificationUrl: this.verificationUrl,
        appName: 'Ficabot',
      })
  }
}
