import PreDiagnosis from '#models/pre_diagnosis'
import Pet from '#models/pet'
import Veterinarian from '#models/veterinarian'
import VetNotification from '#models/vet_notification'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import UrgentPreDiagnosisNotification from '#mails/urgent_pre_diagnosis_notification'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export default class VetNotificationService {
    /**
     * Notify veterinarian of new pre-diagnosis
     */
    async notifyNewPreDiagnosis(preDiagnosis: PreDiagnosis): Promise<void> {
        if (!preDiagnosis.veterinarianId) return

        const vet = await Veterinarian.find(preDiagnosis.veterinarianId)
        if (!vet) return

        const pet = await Pet.find(preDiagnosis.petId)
        if (!pet) return

        const urgencyEmoji = this.getUrgencyEmoji(preDiagnosis.urgencyLevel)
        const isUrgent = preDiagnosis.urgencyLevel === 'critical' || preDiagnosis.urgencyLevel === 'high'

        // Create notification
        await VetNotification.create({
            veterinarianId: vet.id,
            type: isUrgent ? 'urgent_case' : 'new_pre_diagnosis',
            title: `${urgencyEmoji} Nouveau pré-diagnostic${isUrgent ? ' URGENT' : ''}`,
            message: `${pet.name} (${pet.species}) - ${preDiagnosis.userDescription.substring(0, 100)}...`,
            relatedEntityType: 'pre_diagnosis',
            relatedEntityId: preDiagnosis.id,
        })

        // Update notification timestamp
        preDiagnosis.veterinarianNotifiedAt = DateTime.now()
        await preDiagnosis.save()

        // Email notification for urgent cases
        if (isUrgent) {
            try {
                // Check if email is configured
                const smtpHost = env.get('SMTP_HOST')
                if (smtpHost && smtpHost.length > 0) {
                    await mail.send(new UrgentPreDiagnosisNotification(vet, preDiagnosis, pet))
                    logger.info(`[VetNotification] Urgent case email sent to ${vet.email}`)
                } else {
                    logger.warn(`[VetNotification] Email not configured - skipping email notification for ${vet.email}`)
                }
            } catch (error) {
                logger.error(`[VetNotification] Failed to send email to ${vet.email}:`, error)
                // Don't throw - notification was created, email is just a bonus
            }
        }
    }

    /**
     * Get unread notifications count
     */
    async getUnreadCount(veterinarianId: number): Promise<number> {
        const result = await VetNotification.query()
            .where('veterinarianId', veterinarianId)
            .where('isRead', false)
            .count('* as total')

        return result[0].$extras.total
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: number, veterinarianId: number): Promise<boolean> {
        const notification = await VetNotification.query()
            .where('id', notificationId)
            .where('veterinarianId', veterinarianId)
            .first()

        if (!notification) return false

        notification.isRead = true
        notification.readAt = DateTime.now()
        await notification.save()

        return true
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(veterinarianId: number): Promise<void> {
        await VetNotification.query()
            .where('veterinarianId', veterinarianId)
            .where('isRead', false)
            .update({
                isRead: true,
                readAt: DateTime.now(),
            })
    }

    private getUrgencyEmoji(urgency: string | null): string {
        switch (urgency) {
            case 'critical':
                return '🚨'
            case 'high':
                return '⚠️'
            case 'medium':
                return '📋'
            case 'low':
                return 'ℹ️'
            default:
                return '📋'
        }
    }
}
