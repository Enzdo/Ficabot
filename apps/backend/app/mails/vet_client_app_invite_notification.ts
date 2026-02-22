import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class VetClientAppInviteNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Votre vétérinaire vous invite sur Ficabot'

  constructor(
    private recipientEmail: string,
    private vetName: string,
    private clinicName: string | null
  ) {
    super()
  }

  prepare() {
    const appUrl = env.get('VET_FRONTEND_URL')?.replace('vet.', 'app.') || 'https://ficabot.com'

    this.message.to(this.recipientEmail).htmlView('emails/vet_client_app_invite', {
      vetName: this.vetName,
      clinicName: this.clinicName,
      appUrl,
      appName: 'Ficabot',
    })
  }
}
