import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type PreDiagnosis from '#models/pre_diagnosis'
import type Veterinarian from '#models/veterinarian'
import type Pet from '#models/pet'

/**
 * Email notification for urgent pre-diagnosis cases
 */
export default class UrgentPreDiagnosisNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS') || 'noreply@ficabot.com'
  subject = '[URGENT] Nouveau pré-diagnostic nécessitant votre attention'

  constructor(
    private veterinarian: Veterinarian,
    private preDiagnosis: PreDiagnosis,
    private pet: Pet
  ) {
    super()
  }

  /**
   * Prepare the email content
   */
  prepare() {
    const urgencyLabel = this.getUrgencyLabel(this.preDiagnosis.urgencyLevel)
    const urgencyColor = this.getUrgencyColor(this.preDiagnosis.urgencyLevel)

    this.message
      .to(this.veterinarian.email)
      .htmlView('emails/urgent_pre_diagnosis', {
        veterinarian: this.veterinarian,
        preDiagnosis: this.preDiagnosis,
        pet: this.pet,
        urgencyLabel,
        urgencyColor,
        dashboardUrl: env.get('VET_FRONTEND_URL') || 'https://vet.ficabot.com',
      })
  }

  private getUrgencyLabel(urgency: string | null): string {
    switch (urgency) {
      case 'critical':
        return 'CRITIQUE'
      case 'high':
        return 'HAUTE'
      case 'medium':
        return 'MOYENNE'
      case 'low':
        return 'BASSE'
      default:
        return 'NON DÉFINIE'
    }
  }

  private getUrgencyColor(urgency: string | null): string {
    switch (urgency) {
      case 'critical':
        return '#DC2626' // red-600
      case 'high':
        return '#F59E0B' // amber-500
      case 'medium':
        return '#3B82F6' // blue-500
      case 'low':
        return '#10B981' // green-500
      default:
        return '#6B7280' // gray-500
    }
  }
}
