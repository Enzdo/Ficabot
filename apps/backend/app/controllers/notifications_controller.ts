import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import VetNotification from '#models/vet_notification'
import Veterinarian from '#models/veterinarian'

/**
 * Notifications Controller
 * Handles real-time notifications for veterinarians
 *
 * Uses Server-Sent Events (SSE) for real-time updates
 * Alternative to WebSocket for one-way server->client communication
 */
export default class NotificationsController {
  /**
   * SSE endpoint for real-time notifications stream
   * GET /notifications/stream
   */
  async stream({ auth, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    // Set headers for SSE
    response.response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    })

    // Send initial connection confirmation
    response.response.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)

    // Poll for new notifications every 5 seconds
    const intervalId = setInterval(async () => {
      try {
        // Get unread notifications
        const notifications = await VetNotification.query()
          .where('veterinarianId', vet.id)
          .where('isRead', false)
          .orderBy('createdAt', 'desc')
          .limit(10)

        if (notifications.length > 0) {
          // Send notifications to client
          response.response.write(
            `data: ${JSON.stringify({
              type: 'notifications',
              count: notifications.length,
              data: notifications,
              timestamp: Date.now(),
            })}\n\n`
          )
        } else {
          // Send heartbeat to keep connection alive
          response.response.write(
            `data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`
          )
        }
      } catch (error) {
        console.error('SSE error:', error)
        clearInterval(intervalId)
      }
    }, 5000)

    // Cleanup on disconnect
    response.response.on('close', () => {
      clearInterval(intervalId)
    })
  }

  /**
   * Get unread notification count
   * GET /notifications/unread-count
   */
  async unreadCount({ auth, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const count = await VetNotification.query()
      .where('veterinarianId', vet.id)
      .where('isRead', false)
      .count('* as total')

    return response.ok({
      success: true,
      data: {
        count: parseInt(count[0].$extras.total),
      },
    })
  }

  /**
   * Get recent notifications
   * GET /notifications
   */
  async index({ auth, response, request }: HttpContext) {
    const vet = auth.user as Veterinarian
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const notifications = await VetNotification.query()
      .where('veterinarianId', vet.id)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok({
      success: true,
      data: notifications,
    })
  }

  /**
   * Mark notification as read
   * PUT /notifications/:id/read
   */
  async markAsRead({ auth, params, response }: HttpContext) {
    const vet = auth.user as Veterinarian
    const notification = await VetNotification.findOrFail(params.id)

    // Verify ownership
    if (notification.veterinarianId !== vet.id) {
      return response.forbidden({
        success: false,
        message: 'Accès non autorisé',
      })
    }

    notification.isRead = true
    notification.readAt = DateTime.now()
    await notification.save()

    return response.ok({
      success: true,
      data: notification,
    })
  }

  /**
   * Mark all notifications as read
   * PUT /notifications/mark-all-read
   */
  async markAllAsRead({ auth, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    await VetNotification.query()
      .where('veterinarianId', vet.id)
      .where('isRead', false)
      .update({
        isRead: true,
        readAt: DateTime.now(),
      })

    return response.ok({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
    })
  }

  /**
   * Delete notification
   * DELETE /notifications/:id
   */
  async destroy({ auth, params, response }: HttpContext) {
    const vet = auth.user as Veterinarian
    const notification = await VetNotification.findOrFail(params.id)

    // Verify ownership
    if (notification.veterinarianId !== vet.id) {
      return response.forbidden({
        success: false,
        message: 'Accès non autorisé',
      })
    }

    await notification.delete()

    return response.ok({
      success: true,
      message: 'Notification supprimée',
    })
  }
}
