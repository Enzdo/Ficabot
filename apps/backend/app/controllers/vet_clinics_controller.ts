import type { HttpContext } from '@adonisjs/core/http'
import VetClinic from '#models/vet_clinic'

export default class VetClinicsController {
  /**
   * Search clinics by location (for registration map)
   */
  async search({ request, response }: HttpContext) {
    const { lat, lng, radius = 5000, query } = request.only(['lat', 'lng', 'radius', 'query'])

    if (!lat || !lng) {
      return response.badRequest({
        success: false,
        message: 'Latitude et longitude requises',
      })
    }

    // Search in database first
    const clinics = await VetClinic.query()
      .whereRaw(
        `(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) < ?`,
        [lat, lng, lat, radius / 1000]
      )
      .if(query, (q) => q.where('name', 'like', `%${query}%`))
      .limit(20)

    return response.ok({
      success: true,
      data: clinics,
    })
  }

  /**
   * Get or create clinic from Google Places data
   */
  async getOrCreate({ request, response }: HttpContext) {
    const placeData = request.only([
      'placeId',
      'name',
      'address',
      'latitude',
      'longitude',
      'phone',
      'website',
      'rating',
      'userRatingsTotal',
      'openingHours',
      'photoReference',
    ])

    if (!placeData.placeId) {
      return response.badRequest({
        success: false,
        message: 'Place ID requis',
      })
    }

    // Check if clinic already exists
    let clinic = await VetClinic.findBy('place_id', placeData.placeId)

    if (!clinic) {
      // Create new clinic
      clinic = await VetClinic.create({
        placeId: placeData.placeId,
        name: placeData.name,
        address: placeData.address,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        phone: placeData.phone,
        website: placeData.website,
        rating: placeData.rating,
        userRatingsTotal: placeData.userRatingsTotal,
        openingHours: placeData.openingHours,
        photoReference: placeData.photoReference,
        isVerified: false,
      })
    }

    return response.ok({
      success: true,
      data: clinic,
    })
  }

  /**
   * Get clinic details
   */
  async show({ params, response }: HttpContext) {
    const clinic = await VetClinic.query()
      .where('id', params.id)
      .preload('veterinarians', (query) => {
        query.where('verification_status', 'verified')
      })
      .first()

    if (!clinic) {
      return response.notFound({
        success: false,
        message: 'Clinique non trouvée',
      })
    }

    return response.ok({
      success: true,
      data: clinic,
    })
  }

  /**
   * List verified clinics near location (for users to find vets)
   */
  async listVerified({ request, response }: HttpContext) {
    const { lat, lng, radius = 10000 } = request.only(['lat', 'lng', 'radius'])

    if (!lat || !lng) {
      return response.badRequest({
        success: false,
        message: 'Latitude et longitude requises',
      })
    }

    const clinics = await VetClinic.query()
      .where('is_verified', true)
      .whereRaw(
        `(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) < ?`,
        [lat, lng, lat, radius / 1000]
      )
      .preload('veterinarians', (query) => {
        query.where('verification_status', 'verified')
      })
      .orderByRaw(
        `(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))`,
        [lat, lng, lat]
      )
      .limit(50)

    return response.ok({
      success: true,
      data: clinics,
    })
  }
}
