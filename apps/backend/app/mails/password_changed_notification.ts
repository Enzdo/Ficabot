import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'
import { DateTime } from 'luxon'

export default class PasswordChangedNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Votre mot de passe a été modifié – Ficabot'

  constructor(private user: User) {
    super()
  }

  prepare() {
    const appUrl = env.get('VET_FRONTEND_URL') || 'https://app.ficabot.com'
    const changedAt = DateTime.now().setLocale('fr').toFormat("dd MMMM yyyy 'à' HH:mm")

    this.message.to(this.user.email).htmlView('emails/password_changed', {
      user: this.user,
      changedAt,
      appUrl,
      appName: 'Ficabot',
    })
  }
}
