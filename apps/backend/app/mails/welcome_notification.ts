import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'

export default class WelcomeNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Bienvenue sur Ficabot ! 🎉'

  constructor(private user: User) {
    super()
  }

  prepare() {
    this.message.to(this.user.email).htmlView('emails/welcome', {
      user: this.user,
      appUrl: 'ficabot://',
      appName: 'Ficabot',
    })
  }
}
