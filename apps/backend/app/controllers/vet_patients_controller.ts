import type { HttpContext } from '@adonisjs/core/http'
import HealthBook from '#models/health_book'
import Veterinarian from '#models/veterinarian'
import { scopedPets, findScopedPetByToken } from '#services/vet_patient_scope'

export default class VetPatientsController {
  /**
   * Patients du vétérinaire connecté : animaux dont le propriétaire lui est lié
   * et qui ont ouvert l'accès à leur dossier.
   */
  async index({ auth, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pets = await scopedPets(vet.id)
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
          // L'identifiant est nécessaire pour rattacher un rappel à son
          // propriétaire, faute de quoi le rappel reste invisible côté client.
          id: pet.user.id,
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
  async show({ auth, params, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pet = await findScopedPetByToken(vet.id, params.token, (query) => {
      query.preload('healthBook').preload('medicalRecords').preload('user')
    })

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
  async healthBook({ auth, params, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pet = await findScopedPetByToken(vet.id, params.token, (query) => {
      query.preload('healthBook')
    })

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
  async addNote({ auth, params, request, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pet = await findScopedPetByToken(vet.id, params.token, (query) => {
      query.preload('healthBook')
    })

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
  async search({ auth, request, response }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { query } = request.only(['query'])

    const pets = await scopedPets(vet.id)
      .whereILike('name', `%${query}%`)
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
