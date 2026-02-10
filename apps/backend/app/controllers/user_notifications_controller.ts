import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import UserNotification from '#models/user_notification'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'

/**
 * User Notifications Controller
 * Handles real-time notifications for pet owners
 *
 * Uses Server-Sent Events (SSE) for real-time updates
 */
export default class UserNotificationsController {
  /**
   * SSE endpoint for real-time notifications stream
   * GET /user/notifications/stream
   */
  async stream({ auth, response }: HttpContext) {
    const user = auth.user as User

    // Set headers for SSE
    response.response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    })

    // Send initial connection confirmation
    response.response.write(
      `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`
    )

    logger.info(`[UserNotifications] SSE connected for user ${user.id}`)

    // Poll for new notifications every 5 seconds
    const intervalId = setInterval(async () => {
      try {
        // Get unread notifications
        const notifications = await UserNotification.query()
          .where('userId', user.id)
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

          logger.info(
            `[UserNotifications] Sent ${notifications.length} notifications to user ${user.id}`
          )
        } else {
          // Send heartbeat to keep connection alive
          response.response.write(
            `data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`
          )
        }
      } catch (error) {
        logger.error(`[UserNotifications] SSE error for user ${user.id}:`, error)
        clearInterval(intervalId)
      }
    }, 5000)

    // Cleanup on disconnect
    response.response.on('close', () => {
      clearInterval(intervalId)
      logger.info(`[UserNotifications] SSE disconnected for user ${user.id}`)
    })
  }

  /**
   * Get unread notification count
   * GET /user/notifications/unread-count
   */
  async unreadCount({ auth, response }: HttpContext) {
    const user = auth.user as User

    const count = await UserNotification.query()
      .where('userId', user.id)
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
   * GET /user/notifications
   */
  async index({ auth, response, request }: HttpContext) {
    const user = auth.user as User
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const notifications = await UserNotification.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok({
      success: true,
      data: notifications,
    })
  }

  /**
   * Mark notification as read
   * PUT /user/notifications/:id/read
   */
  async markAsRead({ auth, params, response }: HttpContext) {
    const user = auth.user as User
    const notification = await UserNotification.findOrFail(params.id)

    // Verify ownership
    if (notification.userId !== user.id) {
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
   * PUT /user/notifications/mark-all-read
   */
  async markAllAsRead({ auth, response }: HttpContext) {
    const user = auth.user as User

    await UserNotification.query()
      .where('userId', user.id)
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
   * DELETE /user/notifications/:id
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user as User
    const notification = await UserNotification.findOrFail(params.id)

    // Verify ownership
    if (notification.userId !== user.id) {
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
