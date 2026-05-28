import type { HttpContext } from '@adonisjs/core/http'
import MonthlyTip from '#models/monthly_tip'

export default class MonthlyTipsController {
  /**
   * GET /api/tips
   * Query params: species (CSV: dog,cat,nac), month (1-12, defaults to current)
   * Returns 1 tip per species, for the requested month.
   */
  async index({ request, response }: HttpContext) {
    const speciesParam = request.input('species')
    const month = Number(request.input('month')) || new Date().getMonth() + 1

    if (!speciesParam) {
      return response.ok({ success: true, data: [] })
    }

    const speciesArr = String(speciesParam)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (speciesArr.length === 0) {
      return response.ok({ success: true, data: [] })
    }

    const tips = await MonthlyTip.query()
      .whereIn('species', speciesArr)
      .where('month', month)

    response.header('Cache-Control', 'public, max-age=3600')
    return response.ok({ success: true, data: tips.map((t) => t.toJSON()) })
  }
}
