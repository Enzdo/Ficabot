import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type Veterinarian from '#models/veterinarian'

export default class WelcomeVetNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Bienvenue sur Ficabot Pro !'

  constructor(private vet: Veterinarian) {
    super()
  }

  prepare() {
    const dashboardUrl = env.get('VET_FRONTEND_URL') || 'https://vet.ficabot.com'

    this.message.to(this.vet.email).htmlView('emails/welcome_vet', {
      vet: this.vet,
      dashboardUrl,
      appName: 'Ficabot Pro',
    })
  }
}
