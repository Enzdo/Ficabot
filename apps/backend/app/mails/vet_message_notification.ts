import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

/**
 * Un message libre du cabinet à son client.
 *
 * Le corps est rédigé par le praticien — préparé par l'assistant, relu et
 * validé par lui avant l'envoi. Rien n'est composé automatiquement ici : cette
 * classe met en forme, elle n'écrit pas.
 *
 * La réponse va au cabinet et non à `noreply` : un client qui répond à son
 * vétérinaire doit être lu.
 */
export default class VetMessageNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = ''

  constructor(
    private destinataire: string,
    private sujet: string,
    private corps: string,
    private cabinet: {
      nom: string
      praticien: string
      email: string | null
      adresse: string | null
      telephone: string | null
    }
  ) {
    super()
    this.subject = sujet
  }

  prepare() {
    this.message.to(this.destinataire).htmlView('emails/vet_message', {
      sujet: this.sujet,
      corps: this.corps,
      cabinet: this.cabinet.nom,
      praticien: this.cabinet.praticien,
      adresse: this.cabinet.adresse,
      telephone: this.cabinet.telephone,
    })

    if (this.cabinet.email) this.message.replyTo(this.cabinet.email)
  }
}
