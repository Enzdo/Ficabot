import type { HttpContext } from '@adonisjs/core/http'
import Badge from '#models/badge'
import UserBadge from '#models/user_badge'
import { DateTime } from 'luxon'

export default class BadgesController {
  async index({ response }: HttpContext) {
    const badges = await Badge.query().orderBy('category', 'asc')
    return response.ok({ success: true, data: badges })
  }

  async userBadges({ auth, response }: HttpContext) {
    const userBadges = await UserBadge.query()
      .where('user_id', auth.user!.id)
      .preload('badge')
      .preload('pet')
      .orderBy('earned_at', 'desc')

    const totalPoints = userBadges.reduce((sum, ub) => sum + (ub.badge?.points || 0), 0)

    return response.ok({ 
      success: true, 
      data: userBadges,
      totalPoints,
    })
  }

  async checkAndAward({ auth, response }: HttpContext) {
    const userId = auth.user!.id
    const awarded: any[] = []

    // Get all badges and user's current badges
    const allBadges = await Badge.all()
    const userBadges = await UserBadge.query().where('user_id', userId)
    const earnedCodes = userBadges.map(ub => ub.badgeId)

    for (const badge of allBadges) {
      if (earnedCodes.includes(badge.id)) continue

      const earned = await this.checkBadgeCondition(userId, badge.code)
      if (earned) {
        const newBadge = await UserBadge.create({
          userId,
          badgeId: badge.id,
          earnedAt: DateTime.now(),
        })
        await newBadge.load('badge')
        awarded.push(newBadge)
      }
    }

    return response.ok({ success: true, data: awarded })
  }

  private async checkBadgeCondition(userId: number, code: string): Promise<boolean> {
    // Badge conditions logic
    switch (code) {
      case 'first_pet':
        const Pet = (await import('#models/pet')).default
        const petCount = await Pet.query().where('user_id', userId).count('* as count')
        return parseInt(petCount[0].$extras.count) >= 1

      case 'first_weight':
        const WeightHistory = (await import('#models/weight_history')).default
        const weightCount = await WeightHistory.query()
          .whereHas('pet', (q) => q.where('user_id', userId))
          .count('* as count')
        return parseInt(weightCount[0].$extras.count) >= 1

      case 'first_walk':
        const Activity = (await import('#models/activity')).default
        const walkCount = await Activity.query()
          .where('type', 'walk')
          .whereHas('pet', (q) => q.where('user_id', userId))
          .count('* as count')
        return parseInt(walkCount[0].$extras.count) >= 1

      case 'week_streak':
        // Check if user logged activity 7 days in a row
        return false // TODO: implement

      default:
        return false
    }
  }
}
