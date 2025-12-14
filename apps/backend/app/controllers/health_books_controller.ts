import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import HealthBook from '#models/health_book'
import OpenAIService from '#services/openai_service'
import {
  createHealthBookValidator,
  addVaccineValidator,
  addAntiparasiticValidator,
  addDewormingValidator,
  addSurgeryValidator,
  addAllergyValidator,
  addChronicConditionValidator,
  addMedicationValidator,
  addVetVisitValidator,
  addWeightHistoryValidator,
} from '#validators/health_book'

export default class HealthBooksController {
  /**
   * Get health book for a pet (creates one if doesn't exist)
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    let healthBook = await HealthBook.query().where('petId', pet.id).first()

    // Create health book if it doesn't exist
    if (!healthBook) {
      healthBook = await HealthBook.create({
        petId: pet.id,
        isSterilized: false,
      })
    }

    return response.ok({
      success: true,
      data: healthBook.toJSON(),
    })
  }

  /**
   * Update health book
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    let healthBook = await HealthBook.query().where('petId', pet.id).first()

    if (!healthBook) {
      healthBook = await HealthBook.create({
        petId: pet.id,
        isSterilized: false,
      })
    }

    const data = await request.validateUsing(createHealthBookValidator)

    // Update all provided fields
    if (data.identificationNumber !== undefined)
      healthBook.identificationNumber = data.identificationNumber || null
    if (data.identificationType !== undefined)
      healthBook.identificationType = data.identificationType || null
    if (data.identificationDate !== undefined)
      healthBook.identificationDate = data.identificationDate || null
    if (data.identificationLocation !== undefined)
      healthBook.identificationLocation = data.identificationLocation || null

    if (data.passportNumber !== undefined) healthBook.passportNumber = data.passportNumber || null
    if (data.passportIssueDate !== undefined)
      healthBook.passportIssueDate = data.passportIssueDate || null
    if (data.passportIssueLocation !== undefined)
      healthBook.passportIssueLocation = data.passportIssueLocation || null

    if (data.isSterilized !== undefined) healthBook.isSterilized = data.isSterilized
    if (data.sterilizationDate !== undefined)
      healthBook.sterilizationDate = data.sterilizationDate || null
    if (data.sterilizationVetName !== undefined)
      healthBook.sterilizationVetName = data.sterilizationVetName || null

    if (data.bloodType !== undefined) healthBook.bloodType = data.bloodType || null

    if (data.vaccines !== undefined) healthBook.vaccines = JSON.stringify(data.vaccines)
    if (data.antiparasitics !== undefined)
      healthBook.antiparasitics = JSON.stringify(data.antiparasitics)
    if (data.dewormings !== undefined) healthBook.dewormings = JSON.stringify(data.dewormings)
    if (data.surgeries !== undefined) healthBook.surgeries = JSON.stringify(data.surgeries)
    if (data.allergies !== undefined) healthBook.allergies = JSON.stringify(data.allergies)
    if (data.chronicConditions !== undefined)
      healthBook.chronicConditions = JSON.stringify(data.chronicConditions)
    if (data.medications !== undefined) healthBook.medications = JSON.stringify(data.medications)
    if (data.vetVisits !== undefined) healthBook.vetVisits = JSON.stringify(data.vetVisits)
    if (data.weightHistory !== undefined)
      healthBook.weightHistory = JSON.stringify(data.weightHistory)

    if (data.insuranceCompany !== undefined)
      healthBook.insuranceCompany = data.insuranceCompany || null
    if (data.insurancePolicyNumber !== undefined)
      healthBook.insurancePolicyNumber = data.insurancePolicyNumber || null
    if (data.insuranceExpiryDate !== undefined)
      healthBook.insuranceExpiryDate = data.insuranceExpiryDate || null

    if (data.emergencyVetName !== undefined)
      healthBook.emergencyVetName = data.emergencyVetName || null
    if (data.emergencyVetPhone !== undefined)
      healthBook.emergencyVetPhone = data.emergencyVetPhone || null
    if (data.emergencyVetAddress !== undefined)
      healthBook.emergencyVetAddress = data.emergencyVetAddress || null

    if (data.notes !== undefined) healthBook.notes = data.notes || null

    await healthBook.save()

    return response.ok({
      success: true,
      data: healthBook.toJSON(),
    })
  }

  /**
   * Add a vaccine entry
   */
  async addVaccine({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addVaccineValidator)
    const vaccines = this.parseJsonArray(healthBook!.vaccines)
    vaccines.push({ ...data, id: Date.now().toString() })
    healthBook!.vaccines = JSON.stringify(vaccines)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove a vaccine entry
   */
  async removeVaccine({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const vaccines = this.parseJsonArray(healthBook!.vaccines).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.vaccines = JSON.stringify(vaccines)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add an antiparasitic entry
   */
  async addAntiparasitic({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addAntiparasiticValidator)
    const antiparasitics = this.parseJsonArray(healthBook!.antiparasitics)
    antiparasitics.push({ ...data, id: Date.now().toString() })
    healthBook!.antiparasitics = JSON.stringify(antiparasitics)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove an antiparasitic entry
   */
  async removeAntiparasitic({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const antiparasitics = this.parseJsonArray(healthBook!.antiparasitics).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.antiparasitics = JSON.stringify(antiparasitics)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add a deworming entry
   */
  async addDeworming({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addDewormingValidator)
    const dewormings = this.parseJsonArray(healthBook!.dewormings)
    dewormings.push({ ...data, id: Date.now().toString() })
    healthBook!.dewormings = JSON.stringify(dewormings)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove a deworming entry
   */
  async removeDeworming({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const dewormings = this.parseJsonArray(healthBook!.dewormings).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.dewormings = JSON.stringify(dewormings)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add a surgery entry
   */
  async addSurgery({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addSurgeryValidator)
    const surgeries = this.parseJsonArray(healthBook!.surgeries)
    surgeries.push({ ...data, id: Date.now().toString() })
    healthBook!.surgeries = JSON.stringify(surgeries)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove a surgery entry
   */
  async removeSurgery({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const surgeries = this.parseJsonArray(healthBook!.surgeries).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.surgeries = JSON.stringify(surgeries)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add an allergy entry
   */
  async addAllergy({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addAllergyValidator)
    const allergies = this.parseJsonArray(healthBook!.allergies)
    allergies.push({ ...data, id: Date.now().toString() })
    healthBook!.allergies = JSON.stringify(allergies)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove an allergy entry
   */
  async removeAllergy({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const allergies = this.parseJsonArray(healthBook!.allergies).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.allergies = JSON.stringify(allergies)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add a chronic condition entry
   */
  async addChronicCondition({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addChronicConditionValidator)
    const chronicConditions = this.parseJsonArray(healthBook!.chronicConditions)
    chronicConditions.push({ ...data, id: Date.now().toString() })
    healthBook!.chronicConditions = JSON.stringify(chronicConditions)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove a chronic condition entry
   */
  async removeChronicCondition({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const chronicConditions = this.parseJsonArray(healthBook!.chronicConditions).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.chronicConditions = JSON.stringify(chronicConditions)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add a medication entry
   */
  async addMedication({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addMedicationValidator)
    const medications = this.parseJsonArray(healthBook!.medications)
    medications.push({ ...data, id: Date.now().toString() })
    healthBook!.medications = JSON.stringify(medications)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove a medication entry
   */
  async removeMedication({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const medications = this.parseJsonArray(healthBook!.medications).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.medications = JSON.stringify(medications)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add a vet visit entry
   */
  async addVetVisit({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addVetVisitValidator)
    const vetVisits = this.parseJsonArray(healthBook!.vetVisits)
    vetVisits.push({ ...data, id: Date.now().toString() })
    healthBook!.vetVisits = JSON.stringify(vetVisits)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove a vet visit entry
   */
  async removeVetVisit({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const vetVisits = this.parseJsonArray(healthBook!.vetVisits).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.vetVisits = JSON.stringify(vetVisits)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Add a weight history entry
   */
  async addWeightHistory({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const data = await request.validateUsing(addWeightHistoryValidator)
    const weightHistory = this.parseJsonArray(healthBook!.weightHistory)
    weightHistory.push({ ...data, id: Date.now().toString() })
    healthBook!.weightHistory = JSON.stringify(weightHistory)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  /**
   * Remove a weight history entry
   */
  async removeWeightHistory({ auth, params, request, response }: HttpContext) {
    const { healthBook, error } = await this.getHealthBook(auth, params)
    if (error) return response.notFound(error)

    const { entryId } = request.only(['entryId'])
    const weightHistory = this.parseJsonArray(healthBook!.weightHistory).filter(
      (v: any) => v.id !== entryId
    )
    healthBook!.weightHistory = JSON.stringify(weightHistory)
    await healthBook!.save()

    return response.ok({
      success: true,
      data: healthBook!.toJSON(),
    })
  }

  // Helper methods
  private async getHealthBook(auth: any, params: any) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return {
        healthBook: null,
        error: { success: false, message: 'Animal non trouvé' },
      }
    }

    let healthBook = await HealthBook.query().where('petId', pet.id).first()

    if (!healthBook) {
      healthBook = await HealthBook.create({
        petId: pet.id,
        isSterilized: false,
      })
    }

    return { healthBook, error: null }
  }

  private parseJsonArray(value: any): any[] {
    if (Array.isArray(value)) return value
    if (typeof value === 'string' && value) {
      try {
        return JSON.parse(value)
      } catch {
        return []
      }
    }
    return []
  }

  /**
   * Scan a photo of the health book and extract data using GPT Vision
   */
  async scanPhoto({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    const { image } = request.only(['image'])

    if (!image) {
      return response.badRequest({
        success: false,
        message: 'Image requise',
      })
    }

    try {
      const openai = new OpenAIService()
      const extractedData = await openai.analyzeHealthBookPhoto(image, pet.species)

      return response.ok({
        success: true,
        data: extractedData,
        message: 'Données extraites avec succès. Vérifiez et confirmez les informations.',
      })
    } catch (error) {
      console.error('Scan photo error:', error)
      return response.internalServerError({
        success: false,
        message: 'Erreur lors de l\'analyse de l\'image',
      })
    }
  }

  /**
   * Apply scanned data to health book
   */
  async applyScannedData({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    let healthBook = await HealthBook.query().where('petId', pet.id).first()
    if (!healthBook) {
      healthBook = await HealthBook.create({ petId: pet.id, isSterilized: false })
    }

    const data = request.body()

    // Apply identification
    if (data.identification) {
      healthBook.identificationNumber = data.identification.number || healthBook.identificationNumber
      healthBook.identificationType = data.identification.type || healthBook.identificationType
      healthBook.identificationDate = data.identification.date || healthBook.identificationDate
      healthBook.identificationLocation = data.identification.location || healthBook.identificationLocation
    }

    // Apply passport
    if (data.passport) {
      healthBook.passportNumber = data.passport.number || healthBook.passportNumber
      healthBook.passportIssueDate = data.passport.issueDate || healthBook.passportIssueDate
      healthBook.passportIssueLocation = data.passport.issueLocation || healthBook.passportIssueLocation
    }

    // Apply sterilization
    if (data.isSterilized !== undefined) {
      healthBook.isSterilized = data.isSterilized
    }
    if (data.sterilizationDate) {
      healthBook.sterilizationDate = data.sterilizationDate
    }

    // Apply blood type
    if (data.bloodType) {
      healthBook.bloodType = data.bloodType
    }

    // Merge arrays (add new entries)
    if (data.vaccines?.length) {
      const existing = this.parseJsonArray(healthBook.vaccines)
      const newVaccines = data.vaccines.map((v: any) => ({ ...v, id: crypto.randomUUID() }))
      healthBook.vaccines = JSON.stringify([...existing, ...newVaccines])
    }

    if (data.antiparasitics?.length) {
      const existing = this.parseJsonArray(healthBook.antiparasitics)
      const newItems = data.antiparasitics.map((v: any) => ({ ...v, id: crypto.randomUUID() }))
      healthBook.antiparasitics = JSON.stringify([...existing, ...newItems])
    }

    if (data.dewormings?.length) {
      const existing = this.parseJsonArray(healthBook.dewormings)
      const newItems = data.dewormings.map((v: any) => ({ ...v, id: crypto.randomUUID() }))
      healthBook.dewormings = JSON.stringify([...existing, ...newItems])
    }

    if (data.allergies?.length) {
      const existing = this.parseJsonArray(healthBook.allergies)
      const newItems = data.allergies.map((v: any) => ({ ...v, id: crypto.randomUUID() }))
      healthBook.allergies = JSON.stringify([...existing, ...newItems])
    }

    if (data.weightHistory?.length) {
      const existing = this.parseJsonArray(healthBook.weightHistory)
      const newItems = data.weightHistory.map((v: any) => ({ ...v, id: crypto.randomUUID() }))
      healthBook.weightHistory = JSON.stringify([...existing, ...newItems])
    }

    await healthBook.save()

    return response.ok({
      success: true,
      data: healthBook.toJSON(),
      message: 'Données du carnet de santé mises à jour',
    })
  }
}
