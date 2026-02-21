import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetClinic from '#models/vet_clinic'
import { vetRegisterValidator, vetLoginValidator, vetUpdateProfileValidator } from '#validators/vet_auth'
import { DateTime } from 'luxon'

export default class VetAuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(vetRegisterValidator)

    const existingVet = await Veterinarian.findBy('email', data.email)
    if (existingVet) {
      return response.conflict({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }

    // Handle clinic selection
    let clinicId: number | null = null
    
    if (data.clinicData) {
      // Create or get clinic from Google Places data
      let clinic = await VetClinic.findBy('place_id', data.clinicData.placeId)
      
      if (!clinic) {
        clinic = await VetClinic.create({
          placeId: data.clinicData.placeId,
          name: data.clinicData.name,
          address: data.clinicData.address,
          latitude: data.clinicData.latitude,
          longitude: data.clinicData.longitude,
          phone: data.clinicData.phone || null,
          website: data.clinicData.website || null,
          rating: data.clinicData.rating || null,
          userRatingsTotal: data.clinicData.userRatingsTotal || null,
          isVerified: false,
        })
      }
      clinicId = clinic.id
    } else if (data.clinicId) {
      clinicId = data.clinicId
    }

    const vet = await Veterinarian.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      clinicName: data.clinicName,
      phone: data.phone,
      address: data.address,
      licenseNumber: data.licenseNumber,
      specialization: data.specialization,
      isVerified: false,
      clinicId,
      verificationStatus: clinicId ? 'pending' : 'pending',
      verificationRequestedAt: clinicId ? DateTime.now() : null,
    })
    const token = await Veterinarian.accessTokens.create(vet)

    // Load clinic relation
    if (clinicId) {
      await vet.load('clinic')
    }

    return response.created({
      success: true,
      data: {
        vet: {
          id: vet.id,
          email: vet.email,
          firstName: vet.firstName,
          lastName: vet.lastName,
          clinicName: vet.clinicName,
          phone: vet.phone,
          address: vet.address,
          licenseNumber: vet.licenseNumber,
          specialization: vet.specialization,
          isVerified: vet.isVerified,
          verificationStatus: vet.verificationStatus,
          clinic: vet.clinic ? {
            id: vet.clinic.id,
            name: vet.clinic.name,
            address: vet.clinic.address,
          } : null,
        },
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(vetLoginValidator)

    const vet = await Veterinarian.verifyCredentials(email, password)
    const token = await Veterinarian.accessTokens.create(vet)

    return response.ok({
      success: true,
      data: {
        vet: {
          id: vet.id,
          email: vet.email,
          firstName: vet.firstName,
          lastName: vet.lastName,
          clinicName: vet.clinicName,
          phone: vet.phone,
          address: vet.address,
          licenseNumber: vet.licenseNumber,
          specialization: vet.specialization,
          isVerified: vet.isVerified,
        },
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  async me({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    return response.ok({
      success: true,
      data: {
        id: vet.id,
        email: vet.email,
        firstName: vet.firstName,
        lastName: vet.lastName,
        clinicName: vet.clinicName,
        phone: vet.phone,
        address: vet.address,
        licenseNumber: vet.licenseNumber,
        specialization: vet.specialization,
        isVerified: vet.isVerified,
        createdAt: vet.createdAt,
      },
    })
  }

  async updateProfile({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = await request.validateUsing(vetUpdateProfileValidator)

    vet.merge(data)
    await vet.save()

    return response.ok({
      success: true,
      data: {
        id: vet.id,
        email: vet.email,
        firstName: vet.firstName,
        lastName: vet.lastName,
        clinicName: vet.clinicName,
        phone: vet.phone,
        address: vet.address,
        licenseNumber: vet.licenseNumber,
        specialization: vet.specialization,
        isVerified: vet.isVerified,
      },
    })
  }

  async logout({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await Veterinarian.accessTokens.delete(vet, vet.currentAccessToken!.identifier)

    return response.ok({
      success: true,
      message: 'Déconnexion réussie',
    })
  }

  async changePassword({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    // Verify current password
    try {
      await Veterinarian.verifyCredentials(vet.email, currentPassword)
    } catch {
      return response.badRequest({
        success: false,
        message: 'Mot de passe actuel incorrect',
      })
    }

    vet.password = newPassword
    await vet.save()

    return response.ok({
      success: true,
      message: 'Mot de passe modifié avec succès',
    })
  }

  async deleteAccount({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await Veterinarian.accessTokens.delete(vet, vet.currentAccessToken!.identifier)
    await vet.delete()

    return response.ok({
      success: true,
      message: 'Compte supprimé',
    })
  }
}
