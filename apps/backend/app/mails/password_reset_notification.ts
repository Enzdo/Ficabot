import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'

export default class PasswordResetNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Réinitialisation de votre mot de passe – Ficabot'

  constructor(
    private user: User,
    private resetUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.user.email).htmlView('emails/password_reset', {
      user: this.user,
      resetUrl: this.resetUrl,
      appName: 'Ficabot',
    })
  }
}
