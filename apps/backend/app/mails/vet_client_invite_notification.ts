import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class VetClientInviteNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Votre vétérinaire vous invite à rejoindre Ficabot'

  constructor(
    private recipientEmail: string,
    private vetName: string,
    private clinicName: string | null
  ) {
    super()
  }

  prepare() {
    const registerUrl = `${env.get('VET_FRONTEND_URL') || 'https://ficabot.com'}/register`

    this.message.to(this.recipientEmail).htmlView('emails/vet_client_invite', {
      vetName: this.vetName,
      clinicName: this.clinicName,
      registerUrl,
      appName: 'Ficabot',
    })
  }
}
