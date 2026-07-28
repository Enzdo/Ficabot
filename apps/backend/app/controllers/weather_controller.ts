import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { getWeather, searchCities } from '#services/weather_service'

export default class WeatherController {
  /**
   * GET /weather
   * Météo du lieu de vie enregistré sur le compte.
   *
   * Les coordonnées viennent du profil et non de la requête : cela évite
   * d'exposer un proxy météo ouvert à tout venant.
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.user as User

    if (user.latitude === null || user.longitude === null) {
      return response.ok({
        success: true,
        data: null,
        message: 'Aucune ville enregistrée',
      })
    }

    const weather = await getWeather(Number(user.latitude), Number(user.longitude))

    return response.ok({
      success: true,
      data: weather ? { ...weather, city: user.city } : null,
    })
  }

  /**
   * GET /weather/cities?q=lyon
   * Recherche de villes pour l'onboarding.
   */
  async cities({ request, response }: HttpContext) {
    const query = String(request.input('q') ?? '').trim()

    if (query.length < 3) {
      return response.ok({ success: true, data: [] })
    }

    return response.ok({ success: true, data: await searchCities(query) })
  }
}
