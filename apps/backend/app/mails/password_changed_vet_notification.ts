import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type Veterinarian from '#models/veterinarian'
import { DateTime } from 'luxon'

export default class PasswordChangedVetNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Votre mot de passe a été modifié – Ficabot Pro'

  constructor(private vet: Veterinarian) {
    super()
  }

  prepare() {
    const dashboardUrl = env.get('VET_FRONTEND_URL') || 'https://vet.ficabot.com'
    const changedAt = DateTime.now().setLocale('fr').toFormat("dd MMMM yyyy 'à' HH:mm")

    this.message.to(this.vet.email).htmlView('emails/password_changed', {
      user: { firstName: this.vet.firstName, email: this.vet.email },
      changedAt,
      appUrl: dashboardUrl,
      appName: 'Ficabot Pro',
    })
  }
}
