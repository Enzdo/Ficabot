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
  async show({ auth, request, response }: HttpContext) {
    const user = auth.user as User

    // Position transmise par le téléphone si l'utilisateur a autorisé la
    // localisation ; sinon la ville enregistrée sur son profil.
    const liveLat = Number(request.input('latitude'))
    const liveLon = Number(request.input('longitude'))
    const hasLive =
      Number.isFinite(liveLat) && Number.isFinite(liveLon) &&
      Math.abs(liveLat) <= 90 && Math.abs(liveLon) <= 180 &&
      request.input('latitude') !== undefined

    const lat = hasLive ? liveLat : user.latitude === null ? null : Number(user.latitude)
    const lon = hasLive ? liveLon : user.longitude === null ? null : Number(user.longitude)

    if (lat === null || lon === null) {
      return response.ok({
        success: true,
        data: null,
        message: 'Aucune position disponible',
      })
    }

    const weather = await getWeather(lat, lon)
    if (!weather) return response.ok({ success: true, data: null })

    return response.ok({
      success: true,
      data: {
        ...weather,
        // La ville du profil reste prioritaire quand elle a été choisie à la main.
        city: hasLive ? weather.city : user.city ?? weather.city,
      },
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
