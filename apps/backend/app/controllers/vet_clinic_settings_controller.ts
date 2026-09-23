import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
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
        name: vet.clinicName || clinic?.name || '',
        // `address` ne porte plus que la voie : le code postal et la ville sont
        // des colonnes à part. Elles étaient renvoyées vides en dur, ce qui
        // vidait les champs de l'écran à chaque rechargement.
        address: vet.address || clinic?.address || '',
        postalCode: vet.postalCode || '',
        city: vet.city || '',
        phone: vet.phone || clinic?.phone || '',
        website: vet.website || clinic?.website || '',
        email: vet.email,
        siret: vet.siret || '',
        clinicId: clinic?.id || null,
      },
    })
  }

  /**
   * Update clinic info
   */
  async updateClinicInfo({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    // `email` n'est volontairement pas repris : c'est l'adresse de connexion, la
    // changer ici modifierait l'accès au compte. Le champ est en lecture seule.
    const { name, address, phone, website, siret, postalCode, city } = request.only([
      'name', 'address', 'phone', 'website', 'siret', 'postalCode', 'city',
    ])

    await vet.load('clinic')

    // Le praticien fait foi : c'est là que tout est écrit, y compris pour les
    // comptes sans clinique Google rattachée — c'est-à-dire tous ceux créés par
    // l'application.
    vet.clinicName = name ?? vet.clinicName
    vet.address = address ?? vet.address
    vet.postalCode = postalCode ?? vet.postalCode
    vet.city = city ?? vet.city
    vet.phone = phone ?? vet.phone
    vet.website = website ?? vet.website
    vet.siret = siret ?? vet.siret
    await vet.save()

    // Quand une fiche Google est rattachée, on la tient à jour en miroir.
    if (vet.clinic) {
      vet.clinic.merge({
        name,
        address: [address, postalCode, city].filter(Boolean).join(', '),
        phone,
        website,
      })
      await vet.clinic.save()
    }

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

    const hours = (vet.openingHours as any) || (vet.clinic?.openingHours as any) || null

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

    // Écriture inconditionnelle : enfermée dans `if (vet.clinic)`, elle ne
    // s'exécutait pour personne, et le message « Horaires enregistrés »
    // s'affichait quand même. La prise de RDV en ligne répondait « Fermé ce
    // jour » en permanence, faute d'horaires jamais persistés.
    vet.openingHours = hours
    await vet.save()

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
