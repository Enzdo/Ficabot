import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type Veterinarian from '#models/veterinarian'

export default class PasswordResetVetNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = 'Réinitialisation de votre mot de passe – Ficabot Pro'

  constructor(
    private vet: Veterinarian,
    private resetUrl: string
  ) {
    super()
  }

  prepare() {
    // Reuse the same template, mapping vet fields to expected user fields
    this.message.to(this.vet.email).htmlView('emails/password_reset', {
      user: { firstName: this.vet.firstName, email: this.vet.email },
      resetUrl: this.resetUrl,
      appName: 'Ficabot Pro',
    })
  }
}
