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
        const ActivityModel = (await import('#models/activity')).default
        const DateTime = (await import('luxon')).DateTime
        const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toJSDate()

        const recentActivities = await ActivityModel.query()
          .whereHas('pet', (q) => q.where('user_id', userId))
          .where('date', '>=', sevenDaysAgo)
          .select('date')
          .orderBy('date', 'desc')

        if (recentActivities.length === 0) return false

        // Get unique days
        const uniqueDays = new Set(recentActivities.map((a) => a.date.toISODate()))

        // Check if there are 7 consecutive days
        const sortedDays = Array.from(uniqueDays).sort()
        let consecutiveDays = 1
        let maxConsecutive = 1

        for (let i = 1; i < sortedDays.length; i++) {
          const prevDay = DateTime.fromISO(sortedDays[i - 1])
          const currDay = DateTime.fromISO(sortedDays[i])
          const diffDays = currDay.diff(prevDay, 'days').days

          if (diffDays === 1) {
            consecutiveDays++
            maxConsecutive = Math.max(maxConsecutive, consecutiveDays)
          } else {
            consecutiveDays = 1
          }
        }

        return maxConsecutive >= 7

      default:
        return false
    }
  }
}
