import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetClinic from '#models/vet_clinic'
import VetService from '#models/vet_service'

export default class VetClinicSettingsController {
  /**
   * Get clinic info for the authenticated vet
   */
  async getClinicInfo({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await vet.load('clinic')

    const clinic = vet.clinic

    return response.ok({
      success: true,
      data: {
        name: clinic?.name || vet.clinicName || '',
        address: clinic?.address || vet.address || '',
        phone: clinic?.phone || vet.phone || '',
        website: clinic?.website || '',
        email: vet.email,
        siret: '',
        postalCode: '',
        city: '',
        clinicId: clinic?.id || null,
      },
    })
  }

  /**
   * Update clinic info
   */
  async updateClinicInfo({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { name, address, phone, website, email, siret, postalCode, city } = request.only([
      'name', 'address', 'phone', 'website', 'email', 'siret', 'postalCode', 'city',
    ])

    await vet.load('clinic')

    if (vet.clinic) {
      const fullAddress = [address, postalCode, city].filter(Boolean).join(', ')
      vet.clinic.merge({
        name,
        address: fullAddress,
        phone,
        website,
      })
      await vet.clinic.save()
    }

    // Also update legacy fields on vet
    vet.clinicName = name
    vet.address = [address, postalCode, city].filter(Boolean).join(', ')
    await vet.save()

    return response.ok({
      success: true,
      message: 'Informations de la clinique mises à jour',
    })
  }

  /**
   * Get clinic opening hours
   */
  async getHours({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await vet.load('clinic')

    const hours = (vet.clinic?.openingHours as any) || null

    return response.ok({
      success: true,
      data: hours,
    })
  }

  /**
   * Update clinic opening hours
   */
  async updateHours({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { hours } = request.only(['hours'])

    await vet.load('clinic')

    if (vet.clinic) {
      vet.clinic.openingHours = hours
      await vet.clinic.save()
    }

    return response.ok({
      success: true,
      message: 'Horaires mis à jour',
    })
  }

  /**
   * List all services for the authenticated vet
   */
  async listServices({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const services = await VetService.query()
      .where('veterinarian_id', vet.id)
      .orderBy('created_at', 'asc')

    return response.ok({
      success: true,
      data: services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: Number(s.price),
        icon: s.icon,
        colorClass: s.colorClass,
        isActive: s.isActive,
      })),
    })
  }

  /**
   * Create a new service
   */
  async createService({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { name, duration, price, icon, colorClass } = request.only([
      'name', 'duration', 'price', 'icon', 'colorClass',
    ])

    const service = await VetService.create({
      veterinarianId: vet.id,
      name,
      duration: duration || 30,
      price: price || 0,
      icon: icon || '🩺',
      colorClass: colorClass || 'bg-primary-100',
    })

    return response.created({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: Number(service.price),
        icon: service.icon,
        colorClass: service.colorClass,
        isActive: service.isActive,
      },
    })
  }

  /**
   * Update a service
   */
  async updateService({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const service = await VetService.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!service) {
      return response.notFound({ success: false, message: 'Service non trouvé' })
    }

    const { name, duration, price, icon, colorClass } = request.only([
      'name', 'duration', 'price', 'icon', 'colorClass',
    ])

    service.merge({ name, duration, price, icon, colorClass })
    await service.save()

    return response.ok({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: Number(service.price),
        icon: service.icon,
        colorClass: service.colorClass,
        isActive: service.isActive,
      },
    })
  }

  /**
   * Delete a service
   */
  async deleteService({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const service = await VetService.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!service) {
      return response.notFound({ success: false, message: 'Service non trouvé' })
    }

    await service.delete()

    return response.ok({
      success: true,
      message: 'Service supprimé',
    })
  }
}
