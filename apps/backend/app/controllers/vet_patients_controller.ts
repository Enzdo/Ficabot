import type { HttpContext } from '@adonisjs/core/http'
import HealthBook from '#models/health_book'
import Pet from '#models/pet'
import VetExternalClient from '#models/vet_external_client'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import Veterinarian from '#models/veterinarian'
import { scopedPets, findScopedPetByToken } from '#services/vet_patient_scope'

export default class VetPatientsController {
  /**
   * Patients du vétérinaire connecté : animaux dont le propriétaire lui est lié
   * et qui ont ouvert l'accès à leur dossier.
   */
  /**
   * Identité du propriétaire, quelle que soit son origine.
   *
   * Trois cas : un propriétaire inscrit, un client sans compte saisi par le
   * cabinet, ou rien du tout — un animal vu en urgence dont on ne sait pas
   * encore à qui il est. Lire `pet.user.id` sans détour faisait tomber toute la
   * liste dès qu'un patient n'avait pas de propriétaire inscrit.
   */
  private ownerOf(pet: Pet) {
    if (pet.user) {
      return {
        id: pet.user.id,
        firstName: pet.user.firstName,
        lastName: pet.user.lastName,
        email: pet.user.email,
        phone: pet.user.phone,
        kind: 'account' as const,
      }
    }

    if (pet.externalClient) {
      return {
        id: null,
        externalClientId: pet.externalClient.id,
        firstName: pet.externalClient.firstName,
        lastName: pet.externalClient.lastName,
        email: pet.externalClient.email,
        phone: pet.externalClient.phone,
        kind: 'external' as const,
      }
    }

    return null
  }

  async index({ auth, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pets = await scopedPets(vet.id)
      .preload('healthBook')
      .preload('user')
      .preload('externalClient')
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
        // L'identifiant du propriétaire inscrit sert à rattacher un rappel,
        // faute de quoi le rappel reste invisible côté client. Il vaut `null`
        // pour un client sans compte : le rappel restera interne au cabinet.
        owner: this.ownerOf(pet),
      })),
    })
  }

  /**
   * Get detailed patient info by vet access token
   */
  /**
   * Ouvre un dossier patient depuis le cabinet.
   *
   * Un animal n'entrait dans le logiciel que par son propriétaire, via
   * l'application client. Le praticien qui reçoit un nouveau client ne pouvait
   * donc rien saisir — il créait la fiche du propriétaire, et s'arrêtait là.
   *
   * Le dossier créé ici porte le cabinet ; il rejoindra un propriétaire inscrit
   * le jour où celui-ci ouvre un compte, sans rien perdre au passage.
   */
  async store({ auth, request, response }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { name, species, breed, birthDate, weight, externalClientId } = request.only([
      'name',
      'species',
      'breed',
      'birthDate',
      'weight',
      'externalClientId',
    ])

    if (typeof name !== 'string' || !name.trim()) {
      return response.badRequest({ success: false, message: "Le nom de l'animal est requis." })
    }

    // L'espèce n'est pas libre : le dossier, les rappels et les affichages s'y
    // adossent. Une valeur inconnue passerait en base et casserait tout en aval.
    const ESPECES = ['dog', 'cat', 'nac'] as const
    type Espece = (typeof ESPECES)[number]

    if (typeof species !== 'string' || !ESPECES.includes(species as Espece)) {
      return response.badRequest({
        success: false,
        message: 'Espèce invalide : attendu chien, chat ou NAC.',
      })
    }

    // Le client vient du formulaire : on vérifie qu'il est bien du cabinet,
    // sans quoi un patient pourrait être rattaché au client d'un confrère.
    let clientId: number | null = null
    if (externalClientId) {
      const client = await VetExternalClient.query()
        .where('id', Number(externalClientId))
        .where('veterinarian_id', vet.id)
        .first()

      if (!client) {
        return response.badRequest({ success: false, message: 'Client inconnu.' })
      }
      clientId = client.id
    }

    const pet = await Pet.create({
      name: name.trim(),
      species: species as Espece,
      breed: typeof breed === 'string' && breed.trim() ? breed.trim() : null,
      // La date arrive en AAAA-MM-JJ depuis le formulaire ; Lucid attend un
      // DateTime. Une date illisible est ignorée plutôt que de faire échouer
      // la création d'un dossier pour un champ facultatif.
      birthDate: birthDate && DateTime.fromISO(String(birthDate)).isValid
        ? DateTime.fromISO(String(birthDate))
        : null,
      weight: weight === undefined || weight === null || weight === '' ? null : Number(weight),
      veterinarianId: vet.id,
      externalClientId: clientId,
      // Le jeton sert d'identifiant dans les URL du logiciel : sans lui, le
      // dossier existerait sans pouvoir être ouvert.
      vetToken: randomBytes(16).toString('hex'),
    })

    return response.created({
      success: true,
      message: 'Patient créé.',
      data: {
        id: pet.id,
        vetToken: pet.vetToken,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
        weight: pet.weight,
        externalClientId: pet.externalClientId,
      },
    })
  }

  /**
   * PUT /vet/patients/:token — corriger la fiche d'un patient.
   *
   * Elle n'existait pas : on pouvait ouvrir un dossier, jamais rectifier une
   * race mal saisie ou une date de naissance approximative.
   *
   * Le propriétaire ne se change pas ici — déplacer un animal d'un client à
   * un autre touche à sa facturation et à son historique, et mérite un geste
   * explicite plutôt qu'un champ parmi d'autres.
   */
  async update({ auth, params, request, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pet = await findScopedPetByToken(vet.id, params.token)

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Patient non trouvé ou accès révoqué',
      })
    }

    const { name, species, breed, birthDate, weight } = request.only([
      'name',
      'species',
      'breed',
      'birthDate',
      'weight',
    ])

    if (name !== undefined) {
      const propre = String(name).trim()
      if (!propre) {
        return response.badRequest({ success: false, message: "Le nom de l'animal est requis." })
      }
      pet.name = propre
    }

    // Même contrainte qu'à la création : l'espèce commande le dossier, les
    // rappels et les affichages. Une valeur inconnue casserait tout en aval.
    if (species !== undefined) {
      const ESPECES = ['dog', 'cat', 'nac']
      if (!ESPECES.includes(String(species))) {
        return response.badRequest({
          success: false,
          message: 'Espèce invalide : attendu chien, chat ou NAC.',
        })
      }
      pet.species = species
    }

    if (breed !== undefined) pet.breed = String(breed).trim() || null

    if (birthDate !== undefined) {
      if (birthDate === null || birthDate === '') {
        pet.birthDate = null as any
      } else {
        const date = DateTime.fromISO(String(birthDate))
        if (!date.isValid) {
          return response.badRequest({ success: false, message: 'Date de naissance invalide.' })
        }
        if (date > DateTime.now()) {
          return response.badRequest({
            success: false,
            message: 'La date de naissance ne peut pas être à venir.',
          })
        }
        pet.birthDate = date
      }
    }

    if (weight !== undefined) {
      if (weight === null || weight === '') {
        pet.weight = null as any
      } else {
        const valeur = Number(weight)
        if (!Number.isFinite(valeur) || valeur <= 0 || valeur > 1000) {
          return response.badRequest({ success: false, message: 'Poids invalide.' })
        }
        pet.weight = valeur
      }
    }

    await pet.save()

    return response.ok({
      success: true,
      message: 'Fiche mise à jour',
      data: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate ? pet.birthDate.toISODate() : null,
        weight: pet.weight ? Number(pet.weight) : null,
      },
    })
  }

  async show({ auth, params, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pet = await findScopedPetByToken(vet.id, params.token, (query) => {
      query.preload('healthBook').preload('medicalRecords').preload('user').preload('externalClient')
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
          ...this.ownerOf(pet),
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

    const entry = { ...data, addedByVet: true, date: new Date().toISOString() }

    // Quelle rubrique du carnet reçoit l'entrée.
    const rubriques: Record<string, 'vaccines' | 'medications' | 'vetVisits' | 'surgeries'> = {
      vaccine: 'vaccines',
      medication: 'medications',
      vetVisit: 'vetVisits',
      surgery: 'surgeries',
    }

    const rubrique = rubriques[type as string]

    if (!rubrique) {
      return response.badRequest({
        success: false,
        message: 'Type de note invalide',
      })
    }

    // La lecture passe par `parseArrayField`, qui est celle du modèle : un
    // `JSON.parse` brut faisait échouer l'ajout en 500 dès que la colonne ne
    // contenait pas du JSON valide — et le praticien voyait « Unexpected end of
    // JSON input » à la place de sa note.
    const existantes = healthBook.parseArrayField(healthBook[rubrique])
    healthBook[rubrique] = JSON.stringify([...existantes, entry]) as any

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
