import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import HealthBook from '#models/health_book'

export default class VetPatientsController {
  /**
   * List all pets that have granted vet access via token
   */
  async index({ response }: HttpContext) {
    const pets = await Pet.query()
      .whereNotNull('vetToken')
      .preload('healthBook')
      .preload('user')
      .orderBy('name', 'asc')

    return response.ok({
      success: true,
      data: pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
        avatarUrl: pet.avatarUrl,
        vetToken: pet.vetToken,
        hasHealthBook: !!pet.healthBook,
        owner: {
          firstName: pet.user.firstName,
          lastName: pet.user.lastName,
          email: pet.user.email,
        },
      })),
    })
  }

  /**
   * Get detailed patient info by vet access token
   */
  async show({ params, response }: HttpContext) {
    const pet = await Pet.query()
      .where('vetToken', params.token)
      .preload('healthBook')
      .preload('medicalRecords')
      .preload('user')
      .first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Patient non trouvé ou accès révoqué',
      })
    }

    return response.ok({
      success: true,
      data: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
        weight: pet.weight,
        avatarUrl: pet.avatarUrl,
        healthBook: pet.healthBook,
        medicalRecords: pet.medicalRecords,
        owner: {
          id: pet.user.id,
          firstName: pet.user.firstName,
          lastName: pet.user.lastName,
          email: pet.user.email,
          phone: pet.user.phone,
        },
      },
    })
  }

  /**
   * Get health book for a patient
   */
  async healthBook({ params, response }: HttpContext) {
    const pet = await Pet.query()
      .where('vetToken', params.token)
      .preload('healthBook')
      .first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Patient non trouvé ou accès révoqué',
      })
    }

    if (!pet.healthBook) {
      return response.notFound({
        success: false,
        message: 'Carnet de santé non trouvé',
      })
    }

    return response.ok({
      success: true,
      data: pet.healthBook,
    })
  }

  /**
   * Add a medical note to a patient's health book
   */
  async addNote({ params, request, response }: HttpContext) {
    const pet = await Pet.query()
      .where('vetToken', params.token)
      .preload('healthBook')
      .first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Patient non trouvé ou accès révoqué',
      })
    }

    const { type, data } = request.only(['type', 'data'])

    let healthBook = pet.healthBook
    if (!healthBook) {
      healthBook = await HealthBook.create({ petId: pet.id })
      await pet.load('healthBook')
      healthBook = pet.healthBook
    }

    // Add entry based on type
    const entry = { ...data, addedByVet: true, date: new Date().toISOString() }
    
    switch (type) {
      case 'vaccine':
        const vaccines = healthBook.vaccines ? JSON.parse(healthBook.vaccines as any) : []
        healthBook.vaccines = JSON.stringify([...vaccines, entry]) as any
        break
      case 'medication':
        const medications = healthBook.medications ? JSON.parse(healthBook.medications as any) : []
        healthBook.medications = JSON.stringify([...medications, entry]) as any
        break
      case 'vetVisit':
        const vetVisits = healthBook.vetVisits ? JSON.parse(healthBook.vetVisits as any) : []
        healthBook.vetVisits = JSON.stringify([...vetVisits, entry]) as any
        break
      case 'surgery':
        const surgeries = healthBook.surgeries ? JSON.parse(healthBook.surgeries as any) : []
        healthBook.surgeries = JSON.stringify([...surgeries, entry]) as any
        break
      default:
        return response.badRequest({
          success: false,
          message: 'Type de note invalide',
        })
    }

    await healthBook.save()

    return response.ok({
      success: true,
      message: 'Note ajoutée avec succès',
      data: healthBook,
    })
  }

  /**
   * Search patients by name
   */
  async search({ request, response }: HttpContext) {
    const { query } = request.only(['query'])

    const pets = await Pet.query()
      .whereNotNull('vetToken')
      .where('name', 'like', `%${query}%`)
      .preload('healthBook')
      .limit(20)

    return response.ok({
      success: true,
      data: pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        avatarUrl: pet.avatarUrl,
        vetToken: pet.vetToken,
      })),
    })
  }
}
